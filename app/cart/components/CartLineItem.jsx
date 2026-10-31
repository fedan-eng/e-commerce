"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/utils";

function QtyStepper({ value, onChange }) {
  const btn = "flex h-9 w-9 items-center justify-center rounded-full text-forest transition-colors hover:bg-sage disabled:opacity-30";
  return (
    <div className="flex items-center rounded-full border border-line">
      <button type="button" aria-label="Decrease quantity" className={btn} disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <span aria-live="polite" className="w-7 select-none text-center text-sm font-semibold text-forest">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" className={btn} onClick={() => onChange(value + 1)}>
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// Small swatches to switch the colour of an item already in the cart
function ColorSwitch({ colors, selected, onChange }) {
  return (
    <div className="mt-2 flex items-center gap-1.5" role="radiogroup" aria-label="Colour">
      {colors.map((c) => {
        const active = c.name === selected;
        return (
          <button
            key={c.name}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            title={c.name}
            onClick={() => onChange(c.name)}
            className={`h-7 w-7 rounded-full border-2 p-0.5 transition-colors ${active ? "border-forest" : "border-transparent hover:border-line"}`}
          >
            <span className="block h-full w-full rounded-full ring-1 ring-black/5" style={{ backgroundColor: c.name.toLowerCase() }} />
          </button>
        );
      })}
    </div>
  );
}

// colors: the product's colour options (only shown when there's a choice)
export default function CartLineItem({ item, colors, onQuantityChange, onColorChange, onRemove }) {
  const href = `/products/${item._id}`;
  const canSwitchColor = item.color && colors?.length > 1;

  return (
    <li className="flex gap-4 py-5">
      <Link href={href} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-mint sm:h-28 sm:w-28">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="112px" className="object-contain p-2.5" />
        ) : (
          <ShoppingBag size={22} className="absolute inset-0 m-auto text-forest/40" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} className="line-clamp-2 text-[15px] font-semibold leading-snug text-forest hover:underline sm:text-base">
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-muted">
              {formatAmount(item.price)}
              {item.color && !canSwitchColor && <span className="capitalize"> · {item.color}</span>}
            </p>
            {canSwitchColor && <ColorSwitch colors={colors} selected={item.color} onChange={onColorChange} />}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name}`}
            className="shrink-0 rounded-full p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={17} />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <QtyStepper value={item.quantity} onChange={onQuantityChange} />
          <span className="text-base font-bold text-forest">{formatAmount(item.price * item.quantity)}</span>
        </div>
      </div>
    </li>
  );
}
