"use client";
// components/cart/CartParts.jsx — pieces shared by CartSidebar (desktop) and CartBottomSheet (mobile)
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, Check, Truck, ShoppingBag, ArrowRight } from "lucide-react";
import { formatAmount } from "@/lib/utils";
import { STORE_CATEGORIES } from "@/lib/categories";

export function CartHeader({ totalItems, onClose }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <h2 className="text-[20px] font-bold tracking-tight text-[#0A321B]">Your cart</h2>
        <span className="rounded-full bg-[#E8F5EC] px-2.5 py-0.5 text-[12px] font-bold text-[#0A321B]">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>
      <button
        onClick={onClose}
        aria-label="Close cart"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F7F2] text-[#0A321B] transition-colors hover:bg-[#E3EDE6]"
      >
        <span className="text-[18px] leading-none">×</span>
      </button>
    </div>
  );
}

export function AddedBanner({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="mb-4 flex items-center gap-3 rounded-[16px] border border-[#C9EBD5] bg-[#E8F5EC] px-4 py-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1FA34A]">
              <Check size={14} strokeWidth={3} className="text-white" />
            </span>
            <span className="text-[14px] font-semibold text-[#0A321B]">Added to your cart</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DeliveryNote() {
  return (
    <div className="flex items-center gap-2.5 rounded-[14px] bg-[#F3F7F2] px-3.5 py-2.5 text-[12.5px] font-medium text-[#0A321B]">
      <Truck size={16} className="shrink-0 text-[#1FA34A]" />
      Free delivery in Lagos on Thursdays
    </div>
  );
}

export function CartItemRow({ item, onQtyChange, onRemove }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="flex gap-3.5 py-4"
    >
      <span className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[18px] bg-[#F3F7F2]">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="84px" className="object-contain p-2" />
        ) : (
          <ShoppingBag className="absolute inset-0 m-auto h-6 w-6 text-[#C9D6CE]" />
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#0A321B]">{item.name}</p>
          <button
            onClick={() => onRemove(item)}
            aria-label={`Remove ${item.name}`}
            className="shrink-0 rounded-full p-1.5 text-[#8A9A90] transition-colors hover:bg-[#FDECEA] hover:text-[#C0392B]"
          >
            <Trash2 size={15} />
          </button>
        </div>
        {item.color && <p className="mt-0.5 text-[12px] capitalize text-[#5B6B61]">{item.color}</p>}

        <div className="mt-auto flex items-center justify-between pt-2.5">
          <div className="flex items-center rounded-full border border-[#E3EDE6] bg-white">
            <button
              onClick={() => onQtyChange(item, -1)}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#0A321B] transition-colors hover:bg-[#F3F7F2]"
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>
            <span className="w-6 select-none text-center text-[13px] font-bold text-[#0A321B]">{item.quantity}</span>
            <button
              onClick={() => onQtyChange(item, +1)}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#0A321B] transition-colors hover:bg-[#F3F7F2]"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>
          <span className="text-[15px] font-bold text-[#0A321B]">{formatAmount(item.price * item.quantity)}</span>
        </div>
      </div>
    </motion.li>
  );
}

export function CartItemList({ items, onQtyChange, onRemove }) {
  return (
    <ul className="divide-y divide-[#EEF3EF]">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <CartItemRow
            key={`${item._id}-${item.color}`}
            item={item}
            onQtyChange={onQtyChange}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}

export function CartSummary({ subtotal, totalItems, onClose }) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#5B6B61]">Subtotal</p>
          <p className="text-[12px] text-[#8A9A90]">Delivery calculated at checkout</p>
        </div>
        <p className="text-[22px] font-bold tracking-tight text-[#0A321B]">{formatAmount(subtotal)}</p>
      </div>
      <Link
        href="/cart"
        onClick={onClose}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#004328] py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.99]"
      >
        Checkout ({totalItems})
        <ArrowRight size={17} />
      </Link>
      <button
        onClick={onClose}
        className="w-full text-center text-[13px] font-semibold text-[#1FA34A] underline-offset-4 hover:underline"
      >
        Continue shopping
      </button>
    </div>
  );
}

export function EmptyCart({ onClose }) {
  return (
    <div className="flex flex-col items-center px-2 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5EC]">
        <ShoppingBag size={26} className="text-[#0A321B]" />
      </span>
      <p className="mt-4 text-[17px] font-bold text-[#0A321B]">Your cart is empty</p>
      <p className="mt-1 text-[13px] text-[#5B6B61]">Find something that keeps you powered.</p>

      <div className="mt-6 grid w-full grid-cols-2 gap-2">
        {STORE_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/products/${c.slug}`}
            onClick={onClose}
            className="flex items-center gap-2 rounded-[14px] p-2 text-left text-[13px] font-semibold text-[#0A321B] transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: c.theme.cardBg }}
          >
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[10px]" style={{ backgroundColor: c.theme.exploreBg }}>
              <Image src={c.exploreImage} alt="" fill sizes="36px" className="object-contain p-0.5" />
            </span>
            {c.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
