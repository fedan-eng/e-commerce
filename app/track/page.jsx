// app/track/page.jsx — customers check a refund (RF-…) or return (RT-…) with its ID and the email
// or phone on the order. Links in our emails carry a signed key and open the request directly.
import { Suspense } from "react";
import TrackRequest from "./TrackRequest";

export const metadata = {
  title: "Track a refund or return | FIL Store",
  description: "Check the status of your FIL Store refund or return with your request ID.",
  robots: { index: false, follow: false },
};

export default function TrackPage() {
  return (
    <main className="mx-auto w-full max-w-[640px] px-4 py-12 md:py-20">
      <Suspense>
        <TrackRequest />
      </Suspense>
    </main>
  );
}
