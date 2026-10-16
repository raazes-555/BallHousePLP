import "server-only";
import nodemailer from "nodemailer";
import type { OrderRecord } from "@/lib/order-schema";
import { formatNpr } from "@/lib/product";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailFrame(content: string, brand: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f2f4f7;font-family:Arial,sans-serif;color:#111827"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f4f7"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-collapse:collapse"><tr><td style="background:#071226;padding:24px 30px;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-1px">${escapeHtml(brand)} <span style="color:#ffc82e;font-size:11px;letter-spacing:2px">3X3</span></td></tr><tr><td style="padding:32px 30px">${content}</td></tr><tr><td style="padding:20px 30px;background:#f8f9fa;color:#7a8493;font-size:11px;line-height:18px">Cash on Delivery order notification · ${escapeHtml(brand)}</td></tr></table></td></tr></table></body></html>`;
}

function row(label: string, value: string | number, strong = false) {
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #eceff2;color:#77808d;font-size:12px">${escapeHtml(label)}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #eceff2;color:#111827;font-size:${strong ? "16" : "12"}px;font-weight:${strong ? "800" : "600"}">${escapeHtml(value)}</td></tr>`;
}

function businessEmail(order: OrderRecord, brand: string) {
  return emailFrame(`
    <div style="display:inline-block;padding:6px 10px;background:#fff4d3;color:#8b6700;font-size:10px;font-weight:800;letter-spacing:1px">NEW ORDER</div>
    <h1 style="margin:16px 0 8px;font-size:28px;line-height:34px;color:#071226">New product order received</h1>
    <p style="margin:0 0 24px;color:#697385;font-size:13px;line-height:21px">A new Cash on Delivery order is ready for confirmation.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:14px;background:#f7f8fa"><b style="font-size:11px;color:#697385">ORDER ID</b><br><span style="font-size:15px;font-weight:800;color:#f36c21">${escapeHtml(order.orderId)}</span></td><td align="right" style="padding:14px;background:#f7f8fa;font-size:11px;color:#697385">${escapeHtml(order.dateTime)}</td></tr></table>
    <h2 style="margin:26px 0 8px;font-size:15px;color:#071226">Customer details</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Customer name", order.customerName)}${row("Phone number", order.phone)}${row("Email", order.email)}${row("Exact location", order.location)}</table>
    <h2 style="margin:26px 0 8px;font-size:15px;color:#071226">Product & payment</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Product", order.productName)}${row("Quantity", order.quantity)}${row("Price per piece", formatNpr(order.pricePerPiece))}${row("Delivery", `${order.deliveryZone} — ${formatNpr(order.deliveryFee)}`)}${row("Total price", formatNpr(order.totalPrice), true)}${row("Payment method", order.paymentMethod)}${row("Order status", order.orderStatus)}</table>
    <div style="margin-top:24px;padding:16px 18px;border-left:4px solid #f36c21;background:#fff7ed;color:#653715;font-size:13px;line-height:20px"><b>Please call the customer soon to confirm this order.</b></div>
  `, brand);
}

function customerEmail(order: OrderRecord, brand: string, supportEmail: string) {
  return emailFrame(`
    <div style="display:inline-block;padding:6px 10px;background:#eaf8ef;color:#19713b;font-size:10px;font-weight:800;letter-spacing:1px">ORDER RECEIVED</div>
    <h1 style="margin:16px 0 8px;font-size:28px;line-height:34px;color:#071226">Thank you, ${escapeHtml(order.customerName)}!</h1>
    <p style="margin:0 0 22px;color:#697385;font-size:13px;line-height:21px">We have received your order successfully. Our sales representative will call you soon to confirm your order.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:14px;background:#f7f8fa"><b style="font-size:11px;color:#697385">ORDER ID</b><br><span style="font-size:15px;font-weight:800;color:#f36c21">${escapeHtml(order.orderId)}</span></td><td align="right" style="padding:14px;background:#f7f8fa"><span style="display:inline-block;padding:6px 9px;background:#071226;color:#ffffff;font-size:9px;font-weight:800">CASH ON DELIVERY</span></td></tr></table>
    <h2 style="margin:26px 0 8px;font-size:15px;color:#071226">Your order details</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Product", order.productName)}${row("Quantity", order.quantity)}${row("Delivery", `${order.deliveryZone} — ${formatNpr(order.deliveryFee)}`)}${row("Total price", formatNpr(order.totalPrice), true)}${row("Payment method", order.paymentMethod)}</table>
    <div style="margin-top:24px;padding:16px 18px;background:#fff7d9;color:#554413;font-size:12px;line-height:19px">Please keep your phone nearby so our team can verify your delivery details.</div>
    <p style="margin:24px 0 0;color:#697385;font-size:12px;line-height:20px">Need help? Reply to this email or contact <a href="mailto:${escapeHtml(supportEmail)}" style="color:#f36c21">${escapeHtml(supportEmail)}</a>.<br><br>Thank you,<br><b style="color:#071226">${escapeHtml(brand)}</b></p>
  `, brand);
}

export async function sendOrderEmails(order: OrderRecord) {
  const port = Number(required("SMTP_PORT"));
  if (!Number.isInteger(port) || port <= 0) throw new Error("SMTP_PORT must be a valid number.");

  const user = required("SMTP_USER");
  const from = required("EMAIL_FROM");
  const businessEmailAddress = required("BUSINESS_EMAIL");
  const brand = process.env.BRAND_NAME?.trim() || "Ball House";
  const transporter = nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: { user, pass: required("SMTP_PASS") },
  });

  const results = await Promise.allSettled([
    transporter.sendMail({
      from: `${brand} Orders <${from}>`,
      to: businessEmailAddress,
      replyTo: order.email,
      subject: `New Product Order Received - ${order.orderId}`,
      html: businessEmail(order, brand),
      text: `New order ${order.orderId}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nProduct: ${order.productName}\nQuantity: ${order.quantity}\nTotal: ${formatNpr(order.totalPrice)}\nPlease call the customer soon to confirm this order.`,
    }),
    transporter.sendMail({
      from: `${brand} <${from}>`,
      to: order.email,
      replyTo: from,
      subject: `Your Order Has Been Received - ${brand}`,
      html: customerEmail(order, brand, from),
      text: `Hi ${order.customerName},\n\nThank you for your order. We have received it successfully.\n\nProduct: ${order.productName}\nQuantity: ${order.quantity}\nTotal Price: ${formatNpr(order.totalPrice)}\nPayment Method: Cash On Delivery\n\nOur sales representative will call you soon to confirm your order.\n\nThank you,\n${brand}`,
    }),
  ]);

  const failed = results
    .map((result, index) => ({ result, label: index === 0 ? "business notification" : "customer confirmation" }))
    .filter(({ result }) => result.status === "rejected");

  if (failed.length) {
    const labels = failed.map(({ label }) => label).join(" and ");
    throw new Error(`Failed to send ${labels} email.`);
  }
}
