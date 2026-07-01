"use client";

import { useEffect } from "react";

export const useTikTokEvent = () => {
  const trackEvent = (eventName, params = {}) => {
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track(eventName, params);
      console.log(`TikTok Event: ${eventName}`, params);
    } else {
      console.warn("TikTok Pixel not loaded");
    }
  };

  const trackSearch = (searchQuery, resultCount = 0) => {
    trackEvent("Search", {
      query: searchQuery,
      content_ids: [],
      content_type: "product",
      ...(resultCount > 0 && { num_results: resultCount }),
    });
  };

  const trackAddToCart = (product, quantity = 1) => {
    trackEvent("AddToCart", {
      content_id: product._id,
      content_name: product.name,
      content_category: product.category,
      price: product.price,
      quantity: quantity,
      value: product.price * quantity,
      currency: "NGN",
    });
  };

  const trackViewContent = (product) => {
    trackEvent("ViewContent", {
      content_id: product._id,
      content_name: product.name,
      content_category: product.category,
      price: product.price,
      value: product.price,
      currency: "NGN",
    });
  };

  const trackInitiateCheckout = (cartItems, totalValue) => {
    trackEvent("InitiateCheckout", {
      content_ids: cartItems.map((item) => item._id),
      content_type: "product",
      value: totalValue,
      currency: "NGN",
      num_items: cartItems.length,
    });
  };

  const trackPurchase = (cartItems, totalValue, orderId) => {
    trackEvent("Purchase", {
      content_ids: cartItems.map((item) => item._id),
      content_type: "product",
      value: totalValue,
      currency: "NGN",
      num_items: cartItems.length,
      transaction_id: orderId,
    });
  };

  return {
    trackEvent,
    trackSearch,
    trackAddToCart,
    trackViewContent,
    trackInitiateCheckout,
    trackPurchase,
  };
};
