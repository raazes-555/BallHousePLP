"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, MapPin, PackageCheck, ShieldCheck, Truck, UserRound } from "lucide-react";
import { calculateOrderTotal, deliveryOptions, DeliveryZone, formatNpr, product } from "@/lib/product";
import { BrandLogo } from "@/components/brand-logo";

type FormErrors = Record<string, string[]>;

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuantity = Math.min(20, Math.max(1, Number(searchParams.get("quantity")) || 1));
  const [quantity] = useState(initialQuantity);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("inside_valley");
  const [submissionId] = useState(() => crypto.randomUUID());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const total = useMemo(() => calculateOrderTotal(quantity, deliveryZone), [quantity, deliveryZone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});
    setServerError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      location: formData.get("location"),
      website: formData.get("website"),
      productSlug: product.slug,
      quantity,
      deliveryZone,
      submissionId,
    };

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors(result.fieldErrors ?? {});
        setServerError(result.error ?? "We could not submit your order. Please try again.");
        return;
      }

      const query = new URLSearchParams({
        orderId: result.order.orderId,
        product: result.order.productName,
        quantity: String(result.order.quantity),
        total: String(result.order.totalPrice),
      });
      router.push(`/thank-you?${query.toString()}`);
    } catch {
      setServerError("We could not connect to the order service. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="checkout-page">
      <header className="simple-header shell">
        <Link href="/" className="brand-logo-link" aria-label="Ball House home">
          <BrandLogo priority src="/images/ball-house-logo-checkout.png" />
        </Link>
        <div className="secure-note"><LockKeyhole size={15} /><span>Secure Cash on Delivery checkout</span></div>
      </header>

      <div className="checkout-shell shell">
        <section>
          <Link href="/" className="text-link"><ArrowLeft size={15} /> Back to product</Link>
          <h1 className="checkout-title">Complete your order.</h1>
          <p className="checkout-subtitle">No advance payment needed. We’ll call you to confirm before delivery.</p>

          <form className="checkout-card" onSubmit={handleSubmit} noValidate>
            <h2 className="form-section-title"><span>1</span> Your details</h2>
            {serverError && <div className="form-error-banner" role="alert">{serverError}</div>}
            <div className="form-grid">
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.fullName)} />
                {errors.fullName && <span className="field-error">{errors.fullName[0]}</span>}
              </div>
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" aria-invalid={Boolean(errors.phone)} />
                {errors.phone && <span className="field-error">{errors.phone[0]}</span>}
              </div>
              <div className="field field-full">
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
                {errors.email && <span className="field-error">{errors.email[0]}</span>}
              </div>
              <div className="field field-full">
                <label htmlFor="location">Exact location</label>
                <textarea id="location" name="location" autoComplete="street-address" placeholder="Kindly share your exact location" aria-invalid={Boolean(errors.location)} />
                {errors.location && <span className="field-error">{errors.location[0]}</span>}
              </div>
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
            </div>

            <div className="form-divider" />
            <h2 className="form-section-title"><span>2</span> Delivery area</h2>
            <div className="delivery-options">
              {(Object.entries(deliveryOptions) as [DeliveryZone, (typeof deliveryOptions)[DeliveryZone]][]).map(([key, option]) => (
                <label className="delivery-option" key={key}>
                  <div><input type="radio" name="deliveryZone" checked={deliveryZone === key} onChange={() => setDeliveryZone(key)} /><b>{option.label}</b></div>
                  <span>{formatNpr(option.fee)}</span>
                </label>
              ))}
            </div>

            <button className="button button-primary submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><span className="spinner" /> Submitting order...</> : <>Order now — {formatNpr(total)} <ArrowRight size={18} /></>}
            </button>
            <div className="checkout-assurance"><ShieldCheck size={14} /> Your details are used only to process this order.</div>
          </form>
        </section>

        <aside className="summary-column">
          <div className="summary-card">
            <div className="summary-image"><Image src={product.checkoutImage} alt={product.name} fill sizes="(max-width: 960px) 90vw, 40vw" loading="eager" /></div>
            <div className="summary-body">
              <div className="summary-label">Your order</div>
              <h2>{product.name}</h2>
              <div className="summary-line"><span>Price per piece</span><b>{formatNpr(product.salePrice)}</b></div>
              <div className="summary-line"><span>Quantity</span><b>{quantity}</b></div>
              <div className="summary-line"><span>Delivery</span><b>{formatNpr(deliveryOptions[deliveryZone].fee)}</b></div>
              <div className="summary-line summary-line-total"><span>Total</span><b>{formatNpr(total)}</b></div>
              <div className="summary-trust">
                <div><PackageCheck /> Cash on Delivery</div>
                <div><Truck /> Nepal delivery</div>
                <div><MapPin /> Exact address</div>
                <div><UserRound /> Phone confirmation</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
