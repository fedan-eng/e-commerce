"use client";

import { useEffect, useState } from "react";

// { [productId]: product.colors } for the products in the cart, so items can switch colour.
// Refetches only when the set of products changes, not on quantity changes.
export default function useCartColorOptions(items) {
  const [colorsById, setColorsById] = useState({});
  const idsKey = [...new Set(items.map((i) => i._id))].sort().join(",");

  useEffect(() => {
    if (!idsKey) return;
    const controller = new AbortController();

    Promise.all(
      idsKey.split(",").map((id) =>
        fetch(`/api/products/${id}`, { signal: controller.signal })
          .then((res) => (res.ok ? res.json() : null))
          .then((p) => [id, p?.colors || []])
          .catch(() => [id, []])
      )
    ).then((entries) => {
      if (!controller.signal.aborted) setColorsById(Object.fromEntries(entries));
    });

    return () => controller.abort();
  }, [idsKey]);

  return colorsById;
}
