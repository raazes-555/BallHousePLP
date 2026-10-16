import { Suspense } from "react";
import { ThankYouContent } from "@/components/thank-you-content";

export default function ThankYouPage() {
  return (
    <Suspense fallback={<main className="thank-you-page" />}>
      <ThankYouContent />
    </Suspense>
  );
}
