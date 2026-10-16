import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="checkout-page" />}>
      <CheckoutForm />
    </Suspense>
  );
}
