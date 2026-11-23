"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateItemDetails, updatePrices } from "@/store/features/cartSlice";

const EXTRA_KEYS = ["originalPrice", "bundle", "deal"];
const sameExtras = (item, extras) => EXTRA_KEYS.every((k) => JSON.stringify(item[k]) === JSON.stringify(extras[k]));

// { [productId]: product.colors } for the products in the cart, so items can switch colour.
// Also brings prices, prices before discount, bundle and Black Friday deal details up to date
// (/api/cart/prices). Refetches only when the set of products changes, not on quantity changes.
export default function useCartColorOptions(items) {
  const dispatch = useDispatch();
  const [colorsById, setColorsById] = useState({});
  const [pricesById, setPricesById] = useState({});
  const idsKey = [...new Set(items.map((i) => i._id))].sort().join(",");

  useEffect(() => {
    if (!idsKey) return;
    const controller = new AbortController();
    const ids = idsKey.split(",");

    Promise.all(
      ids.map((id) =>
        fetch(`/api/products/${id}`, { signal: controller.signal })
          .then((res) => (res.ok ? res.json() : null))
          .then((p) => [id, p?.colors || []])
          .catch(() => [id, []])
      )
    ).then((entries) => {
      if (!controller.signal.aborted) setColorsById(Object.fromEntries(entries));
    });

    fetch("/api/cart/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!controller.signal.aborted && data?.prices) setPricesById(data.prices);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [idsKey]);

  // Separate from the fetch so it doesn't refetch whenever an item changes
  useEffect(() => {
    const prices = {};
    const details = {};
    for (const item of items) {
      const today = pricesById[item._id];
      if (!today) continue;
      if (typeof today.price === "number" && today.price !== item.price) prices[item._id] = today.price;
      const extras = today.extras || {};
      if (!sameExtras(item, extras)) details[item._id] = extras;
    }
    if (Object.keys(prices).length) dispatch(updatePrices(prices));
    if (Object.keys(details).length) dispatch(updateItemDetails(details));
  }, [items, pricesById, dispatch]);

  return colorsById;
}
