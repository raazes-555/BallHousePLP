"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, PhoneCall } from "lucide-react";
import { formatNpr, product } from "@/lib/product";

export function ThankYouContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "Order received";
  const productName = params.get("product") || product.name;
  const quantity = Math.max(1, Number(params.get("quantity")) || 1);
  const total = Math.max(product.salePrice, Number(params.get("total")) || product.salePrice);

  return (
    <main className="thank-you-page">
      <div className="thank-you-wrap">
        <div className="success-icon"><Check /></div>
        <div className="eyebrow" style={{ justifyContent: "center", marginTop: 24 }}>Order successfully received</div>
        <h1 className="thank-you-title">Thank you for<br />your order!</h1>
        <p className="thank-you-lede">We’ve sent a confirmation to your email. Our sales representative will call you soon to confirm your order.</p>

        <section className="confirmation-card" aria-label="Order confirmation">
          <div className="order-id-row"><span>Order ID</span><b>{orderId}</b></div>
          <div className="confirmation-product">
            <div className="confirmation-thumb"><Image src={product.heroImage} alt="" fill sizes="90px" /></div>
            <div><h2>{productName}</h2><p>Quantity: {quantity} · Payment: Cash On Delivery</p></div>
          </div>
          <div className="confirmation-total"><span>Total payable on delivery</span><b>{formatNpr(total)}</b></div>
        </section>

        <div className="callout"><PhoneCall size={19} /><span><b>What happens next?</b><br />Keep your phone nearby. Our team will call to verify your delivery location and confirm your order.</span></div>
        <Link className="button button-yellow" href="/"><ArrowLeft size={18} /> Back to home</Link>
      </div>
    </main>
  );
}
