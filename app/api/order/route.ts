import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";
import { saveOrderToSheet } from "@/lib/google-sheets";
import { orderRequestSchema, type OrderRecord } from "@/lib/order-schema";
import { calculateOrderTotal, deliveryOptions, product } from "@/lib/product";

export const runtime = "nodejs";

type RateEntry = { count: number; resetAt: number };
const globalRateStore = globalThis as typeof globalThis & { __orderRateLimit?: Map<string, RateEntry> };
const rateStore = globalRateStore.__orderRateLimit ?? new Map<string, RateEntry>();
globalRateStore.__orderRateLimit = rateStore;

function isRateLimited(ip: string) {
  const now = Date.now();
  const existing = rateStore.get(ip);
  if (!existing || existing.resetAt < now) {
    rateStore.set(ip, { count: 1, resetAt: now + 10 * 60_000 });
    return false;
  }
  existing.count += 1;
  return existing.count > 8;
}

function originAllowed(request: NextRequest) {
  const allowedUrl = process.env.FRONTEND_URL?.trim();
  const origin = request.headers.get("origin");
  if (!allowedUrl || !origin) return true;
  try {
    return new URL(origin).origin === new URL(allowedUrl).origin;
  } catch {
    return false;
  }
}

function makeOrderId(submissionId: string) {
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kathmandu" }).replaceAll("-", "");
  const token = createHash("sha256").update(submissionId).digest("hex").slice(0, 8).toUpperCase();
  return `WIL-${date}-${token}`;
}

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: "This request origin is not allowed." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many order attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
  }

  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (parsed.data.productSlug !== product.slug) {
    return NextResponse.json({ error: "The selected product is unavailable." }, { status: 400 });
  }

  const zone = deliveryOptions[parsed.data.deliveryZone];
  const order: OrderRecord = {
    orderId: makeOrderId(parsed.data.submissionId),
    dateTime: new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kathmandu",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date()),
    customerName: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email,
    location: parsed.data.location,
    productName: product.name,
    quantity: parsed.data.quantity,
    pricePerPiece: product.salePrice,
    deliveryZone: zone.label,
    deliveryFee: zone.fee,
    totalPrice: calculateOrderTotal(parsed.data.quantity, parsed.data.deliveryZone),
    paymentMethod: "Cash On Delivery",
    orderStatus: "New Order",
    notes: "",
  };

  try {
    await saveOrderToSheet(order);
    await sendOrderEmails(order);
    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        productName: order.productName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error) {
    console.error("Order submission failed", {
      orderId: order.orderId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Your order could not be completed. No payment was taken. Please try again or contact us." },
      { status: 502 },
    );
  }
}
