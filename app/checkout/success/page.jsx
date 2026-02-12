// /app/checkout/success/page.js
import { Suspense } from "react";
import VerifyPaymentPage from "@/components/VerifyPaymentPage";
import Loading from "@/components/Loading";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen">
          <Loading />
        </div>
      }
    >
      <VerifyPaymentPage />
    </Suspense>
  );
}
