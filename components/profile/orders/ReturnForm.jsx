"use client";
// components/profile/orders/ReturnForm.jsx — return request for one item (POST /api/returns),
// with the bank details for the refund.
import { useState } from "react";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { ProductImage } from "@/components/ProductImage";
import { Field, inputClass } from "@/components/checkout/formFields";
import { formatAmount } from "@/lib/utils";

const EMPTY = {
  productCondition: "",
  returnQuantity: "",
  reasonForReturn: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
};

export default function ReturnForm({ order, item, onBack }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState("");
  const maxQty = Number(item.quantity) || 1;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post("/api/returns", {
        ...form,
        amount: order.total,
        address: order.address,
        region: order.region?.name || order.region,
        city: order.city,
        phone: order.phone,
        orderId: order._id,
        productName: item.name,
        productPrice: item.price,
      });
      setSent(res.data.message || "Return request sent. We'll be in touch.");
      setForm(EMPTY);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const input = (name, props = {}) => (
    <input id={name} name={name} value={form[name]} onChange={onChange} required className={inputClass(false)} {...props} />
  );

  return (
    <section className="rounded-[24px] border border-line p-6 sm:p-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-forest">
        <ArrowLeft size={16} /> Back to order
      </button>
      <h2 className="mt-4 text-xl font-bold text-forest">Return an item</h2>
      <p className="mt-1 text-sm text-muted">Tell us what happened and where to send your refund.</p>

      <div className="mt-6 flex items-center gap-3 rounded-[20px] bg-sage p-3">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white">
          <ProductImage src={item.image} alt={item.name} width={52} height={52} className="h-[52px] w-[52px] object-contain" />
        </span>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-ink">{item.name}</p>
          <p className="text-xs text-muted">
            Qty {item.quantity} · {formatAmount(item.price)}
          </p>
        </div>
      </div>

      {sent ? (
        <div className="mt-6 rounded-[20px] bg-mint p-5">
          <p className="font-bold text-forest">Request sent</p>
          <p className="mt-1 text-sm text-forest/80">{sent}</p>
          <button type="button" onClick={onBack} className="mt-4 text-sm font-semibold text-forest underline underline-offset-4">
            Back to order
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Condition of the item" htmlFor="productCondition" required>
              {input("productCondition", { placeholder: "e.g. Unopened, faulty, damaged" })}
            </Field>
            <Field label={`Quantity to return (max ${maxQty})`} htmlFor="returnQuantity" required>
              <input
                id="returnQuantity"
                name="returnQuantity"
                type="number"
                min={1}
                max={maxQty}
                required
                value={form.returnQuantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, returnQuantity: e.target.value === "" ? "" : Math.min(Number(e.target.value), maxQty) }))
                }
                className={inputClass(false)}
              />
            </Field>
            <Field label="Reason for the return" htmlFor="reasonForReturn" required className="sm:col-span-2">
              <textarea
                id="reasonForReturn"
                name="reasonForReturn"
                rows={4}
                required
                value={form.reasonForReturn}
                onChange={onChange}
                className={`${inputClass(false)} resize-none`}
              />
            </Field>
          </div>

          <h3 className="mt-8 font-bold text-forest">Refund details</h3>
          <p className="mt-1 text-sm text-muted">The account we&apos;ll refund once we receive the item.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Bank name" htmlFor="bankName" required>
              {input("bankName")}
            </Field>
            <Field label="Account number" htmlFor="accountNumber" required>
              {input("accountNumber", { inputMode: "numeric", maxLength: 10 })}
            </Field>
            <Field label="Account name" htmlFor="accountName" required className="sm:col-span-2">
              {input("accountName")}
            </Field>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onBack}
              className="h-12 rounded-full px-6 text-[15px] font-semibold text-forest transition-colors hover:bg-sage"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 rounded-full bg-forest px-8 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send return request"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
