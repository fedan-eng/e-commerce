"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Container, SectionHeading } from "./ui";
import RelatedProductCard from "./RelatedProductCard";

const LIMIT = 4;
const CARD_BGS = ["#cff6df", "#fff0b3", "#daf0ff", "#ffddd0"];

async function fetchRelated(product, signal) {
  try {
    const res = await axios.get(`/api/products/${product._id}/related`, { signal });
    return res.data?.related || [];
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    // Fall back to the same category
    const res = await axios.get(`/api/products?categories=${encodeURIComponent(product.category)}&limit=${LIMIT + 1}`, { signal });
    return res.data?.products || [];
  }
}

export default function RelatedProducts({ product }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRelated(product, controller.signal)
      .then((list) => setItems(list.filter((p) => p._id !== product._id).slice(0, LIMIT)))
      .catch((err) => !axios.isCancel(err) && setItems([]));
    return () => controller.abort();
  }, [product]);

  if (!items.length) return null;

  return (
    <section className="pb-16 pt-6 md:pb-24">
      <Container>
        <SectionHeading title="You might also like" />
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-[18px]">
          {items.map((p, i) => (
            <RelatedProductCard key={p._id} product={p} bg={CARD_BGS[i % CARD_BGS.length]} />
          ))}
        </div>
      </Container>
    </section>
  );
}
