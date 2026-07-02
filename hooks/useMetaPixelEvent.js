"use client";

import { useCookieConsent } from '../context/CookieConsentContext';

/**
 * useMetaPixelEvent — safely fires Meta Pixel events using standard event names.
 * 
 * Standard Meta Pixel Events:
 * - AddToCart
 * - ViewContent
 * - InitiateCheckout
 * - Purchase
 * 
 * Usage:
 *   const { trackAddToCart, trackViewContent, trackInitiateCheckout, trackPurchase } = useMetaPixelEvent()
 *   trackAddToCart(product, 1)
 */
export const useMetaPixelEvent = () => {
  const { preferences } = useCookieConsent();

  const trackEvent = (eventName, params = {}) => {
    if (!preferences.analytics) {
      console.log(`[Meta Pixel] Analytics consent not given, skipping event: ${eventName}`);
      return;
    }
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", eventName, params);
      console.log(`[Meta Pixel] Event fired: ${eventName}`, params);
    } else {
      console.warn("[Meta Pixel] fbq not loaded");
    }
  };

  const trackAddToCart = (product, quantity = 1) => {
    trackEvent("AddToCart", {
      content_ids: [product._id],
      content_name: product.name,
      content_category: product.category,
      content_type: "product",
      price: product.price,
      value: product.price * quantity,
      currency: "NGN",
      quantity: quantity,
    });
  };

  const trackViewContent = (product) => {
    trackEvent("ViewContent", {
      content_ids: [product._id],
      content_name: product.name,
      content_category: product.category,
      content_type: "product",
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

  const trackPurchase = (orderData, cartItems) => {
    const totalValue = Number(orderData.total || orderData.subTotal || 0);
    trackEvent("Purchase", {
      content_ids: cartItems.map((item) => item._id),
      content_type: "product",
      value: totalValue,
      currency: "NGN",
      num_items: cartItems.length,
      transaction_id: orderData.paymentReference || String(orderData._id),
    });
  };

  return {
    trackEvent,
    trackAddToCart,
    trackViewContent,
    trackInitiateCheckout,
    trackPurchase,
  };
};
