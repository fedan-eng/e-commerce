import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { formatAmount } from "@/lib/utils";

function Row({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between text-[15px]">
      <span className="text-muted">{label}</span>
      <span className={muted ? "text-sm text-muted" : "font-medium text-forest"}>{value}</span>
    </div>
  );
}

export default function OrderSummary({ subTotal, itemCount, isAuthenticated, onCheckout }) {
  return (
    <div className="rounded-[28px] bg-sage p-6 md:p-7">
      <h2 className="text-xl font-bold text-forest">Order summary</h2>

      <div className="mt-5 flex flex-col gap-3">
        <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "items"})`} value={formatAmount(subTotal)} />
        <Row label="Delivery" value="Calculated at checkout" muted />
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-base font-semibold text-forest">Total</span>
        <span className="text-[26px] font-bold tracking-tight text-forest">{formatAmount(subTotal)}</span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-forest text-base font-semibold text-white transition-colors hover:bg-black"
      >
        Checkout <ArrowRight size={18} />
      </button>

      {!isAuthenticated && (
        <p className="mt-4 text-center text-sm text-muted">
          Have an account?{" "}
          <Link href="/login?callbackUrl=/cart" className="font-semibold text-forest underline underline-offset-2">
            Log in to check out faster
          </Link>
        </p>
      )}

      <ul className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-sm text-forest">
        <li className="flex items-center gap-2.5">
          <Truck size={17} className="shrink-0" /> Free delivery in Lagos on Thursdays
        </li>
        <li className="flex items-center gap-2.5">
          <ShieldCheck size={17} className="shrink-0" />
          <span className="flex-1">Secure payment</span>
          <span className="flex h-[26px] items-center rounded-full border border-forest bg-white px-2.5">
            <Image src="/paystack.png" alt="Paystack" width={52} height={24} className="h-6 w-auto" />
          </span>
        </li>
      </ul>
    </div>
  );
}
