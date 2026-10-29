"use client";
// components/checkout/steps.jsx — the Contact, Delivery and Review steps of CheckoutModal
import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Info, ShoppingBag } from "lucide-react";
import { formatAmount } from "@/lib/utils";
import PromoCodeInput from "@/components/PromoCodeInput";
import { RegionField, TextAreaField, TextField } from "./formFields";
import { DELIVERY_OPTIONS, deliveryFeeFor, isFreeDeliveryAvailable } from "./delivery";

// ─── Step 1 ───────────────────────────────────────────────────────────────────

export function ContactStep({ form, emailLocked }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <TextField form={form} name="firstName" label="First name" required autoComplete="given-name" placeholder="Lanre" maxLength={50} />
      <TextField form={form} name="lastName" label="Last name" required autoComplete="family-name" placeholder="Koleola" maxLength={50} />
      <TextField
        form={form}
        name="email"
        label="Email address"
        required
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="koleola.k@gmail.com"
        maxLength={254}
        disabled={emailLocked}
        className="col-span-2"
      />
      <TextField
        form={form}
        name="phone"
        label="Phone number"
        required
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="080 000 0000"
        maxLength={15}
        className="col-span-2 sm:col-span-1"
      />
      <TextField
        form={form}
        name="addPhone"
        label="Alternative number"
        optional
        type="tel"
        inputMode="tel"
        placeholder="In case we can't reach you"
        maxLength={15}
        className="col-span-2 sm:col-span-1"
      />
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function DeliveryOption({ option, selected, disabled, fee, regionChosen, onSelect }) {
  const { icon: Icon, title, detail, id } = option;
  const price = id === "Free" ? "Free" : regionChosen ? formatAmount(fee) : "—";

  return (
    <label
      className={`flex items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${selected ? "border-forest bg-mint/40" : "border-line hover:border-[#b9cbc2]"}`}
    >
      <input type="radio" name="deliveryType" value={id} checked={selected} disabled={disabled} onChange={onSelect} className="sr-only" />
      <Icon size={18} className="mt-0.5 shrink-0 text-forest" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-forest">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-muted">
          {disabled ? "Available on orders of ₦10,000 or more" : detail}
        </span>
      </span>
      <span className={`shrink-0 text-[15px] font-semibold ${id === "Free" ? "text-[#0b9a52]" : "text-forest"}`}>{price}</span>
    </label>
  );
}

export function DeliveryStep({ form, subTotal }) {
  const [noteOpen, setNoteOpen] = useState(Boolean(form.values.orderNote));
  const { region, deliveryType } = form.values;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RegionField form={form} />
        <TextField form={form} name="city" label="City" required autoComplete="address-level2" placeholder="e.g. Ikeja" />
      </div>
      <TextField form={form} name="address" label="Delivery address" required autoComplete="street-address" placeholder="House number, street, landmark" />

      <div className="rounded-2xl border border-line">
        <button
          type="button"
          onClick={() => setNoteOpen((o) => !o)}
          aria-expanded={noteOpen}
          className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold text-forest"
        >
          Add an order note
          <ChevronDown size={16} className={`transition-transform ${noteOpen ? "rotate-180" : ""}`} />
        </button>
        {noteOpen && (
          <div className="px-4 pb-4">
            <TextAreaField form={form} name="orderNote" label="Special instructions" rows={3} placeholder="Gate code, best time to call…" />
          </div>
        )}
      </div>

      <fieldset className="mt-2">
        <legend className="mb-3 text-sm font-semibold text-forest">Delivery option</legend>
        <div className="flex flex-col gap-2.5">
          {DELIVERY_OPTIONS.map((option) => (
            <DeliveryOption
              key={option.id}
              option={option}
              selected={deliveryType === option.id}
              disabled={option.id === "Free" && !isFreeDeliveryAvailable(subTotal)}
              fee={deliveryFeeFor(option.id, region)}
              regionChosen={Boolean(region?.name)}
              onSelect={form.onChange}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function SummaryCard({ title, onEdit, children }) {
  return (
    <div className="rounded-2xl bg-sage p-4">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-forest underline underline-offset-2">
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function OrderItem({ item }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mint">
        {item.image ? (
          <Image src={item.image} alt="" fill sizes="56px" className="object-contain p-1.5" />
        ) : (
          <ShoppingBag size={18} className="absolute inset-0 m-auto text-forest/40" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-forest">{item.name}</p>
        <p className="mt-0.5 text-[13px] text-muted">
          {item.quantity} × {formatAmount(item.price)}
          {item.color && <span className="capitalize"> · {item.color}</span>}
        </p>
      </div>
      <span className="shrink-0 text-sm font-semibold text-forest">{formatAmount(item.price * item.quantity)}</span>
    </li>
  );
}

function TotalRow({ label, value, strong }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-line pt-3 text-base font-bold text-forest" : "text-sm text-muted"}`}>
      <span>{label}</span>
      <span className={strong ? "" : "font-medium text-forest"}>{value}</span>
    </div>
  );
}

export function ReviewStep({ form, items, totals, isGuest, onEdit, onPromoApply, promoResetKey, userId }) {
  const v = form.values;

  return (
    <div className="flex flex-col gap-4">
      <SummaryCard title="Contact" onEdit={() => onEdit(1)}>
        <p className="text-[15px] font-semibold text-forest">
          {v.firstName} {v.lastName}
        </p>
        <p className="mt-0.5 break-words text-sm text-muted">
          {v.phone}
          {v.addPhone && ` · ${v.addPhone}`} · {v.email}
        </p>
      </SummaryCard>

      <SummaryCard title="Delivery" onEdit={() => onEdit(2)}>
        <p className="text-[15px] font-semibold text-forest">{v.address}</p>
        <p className="mt-0.5 text-sm text-muted">
          {v.city}, {v.region?.name} · {DELIVERY_OPTIONS.find((o) => o.id === v.deliveryType)?.title}
        </p>
        {v.orderNote && <p className="mt-1 text-[13px] italic text-muted">Note: {v.orderNote}</p>}
      </SummaryCard>

      {isGuest && (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-forest">
          <input type="checkbox" name="saveForLater" checked={v.saveForLater} onChange={form.onChange} className="h-4 w-4 accent-[#004328]" />
          Save my details for next time
        </label>
      )}

      <div>
        <p className="text-sm font-semibold text-forest">Your order</p>
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <OrderItem key={`${item._id}-${item.color}`} item={item} />
          ))}
        </ul>
      </div>

      <PromoCodeInput key={promoResetKey} subTotal={totals.subTotal} onApply={onPromoApply} userId={userId} phone={v.phone} email={v.email} />

      <div className="flex flex-col gap-2.5">
        <TotalRow label="Subtotal" value={formatAmount(totals.subTotal)} />
        {totals.discount > 0 && <TotalRow label="Discount" value={`−${formatAmount(totals.discount)}`} />}
        <TotalRow label="Delivery" value={totals.deliveryFee ? formatAmount(totals.deliveryFee) : "Free"} />
        <TotalRow label="Total" value={formatAmount(totals.total)} strong />
      </div>

      <p className="flex items-center gap-2 rounded-2xl bg-mint/50 px-4 py-3 text-[13px] text-forest">
        <Info size={16} className="shrink-0" />
        You&apos;ll get an order confirmation by email once payment goes through.
      </p>
    </div>
  );
}
