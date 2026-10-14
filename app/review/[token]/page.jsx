// app/review/[token]/page.jsx — where the "Rate it" buttons in review emails land.
// No login needed: the signed link identifies the order and product.
import Image from "next/image";
import Link from "next/link";
import { CircleCheck, CircleAlert } from "lucide-react";
import { connectDB } from "@/lib/db";
import { ReviewError, loadReviewRequest } from "@/lib/reviews";
import ReviewLinkForm from "./ReviewLinkForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review your purchase | FIL Store", robots: { index: false, follow: false } };

function Message({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-forest">
        <Icon size={26} />
      </span>
      <h1 className="mt-4 text-2xl font-bold text-forest">{title}</h1>
      <div className="mt-2 text-[15px] text-muted">{children}</div>
    </div>
  );
}

async function getRequest(token) {
  await connectDB();
  try {
    return { request: await loadReviewRequest(token) };
  } catch (err) {
    if (err instanceof ReviewError) return { error: err.message };
    throw err;
  }
}

export default async function ReviewPage({ params }) {
  const { token } = await params;
  const { request, error } = await getRequest(token);

  return (
    <main className="mx-auto w-full max-w-[560px] px-4 py-12 md:py-20">
      <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_40px_rgba(0,67,40,0.08)] ring-1 ring-line md:p-8">
        {error ? (
          <Message icon={CircleAlert} title="We can't open this review">
            <p>{error}</p>
            <Link href="/products" className="mt-5 inline-block font-semibold text-forest underline underline-offset-2">
              Browse products
            </Link>
          </Message>
        ) : request.alreadyReviewed ? (
          <Message icon={CircleCheck} title="Thanks, you've already reviewed this">
            <Link href={`/products/${request.product._id}#reviews-section`} className="font-semibold text-forest underline underline-offset-2">
              See the reviews
            </Link>
          </Message>
        ) : (
          <>
            <p className="text-sm font-medium text-muted">Hi {request.order.firstName || "there"}, how's it going with your</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px] bg-mint">
                {(request.item.image || request.product.image) && (
                  <Image src={request.item.image || request.product.image} alt="" fill sizes="80px" className="object-contain p-2" />
                )}
              </span>
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-snug text-forest">{request.product.name}</h1>
                {request.item.color && <p className="mt-1 text-sm capitalize text-muted">{request.item.color}</p>}
              </div>
            </div>
            <ReviewLinkForm token={token} productId={String(request.product._id)} />
          </>
        )}
      </div>
    </main>
  );
}
