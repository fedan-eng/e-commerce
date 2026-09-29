"use client";

import { createContext, useContext } from "react";

/**
 * CartAnimationContext
 *
 * Provides `cartIconRef` and `triggerFly` to any component in the tree
 * without prop-drilling through Navbar → Layout → Page → ProductDetailsInfo.
 *
 * Provider lives in the root layout (or ClientLayout wrapper).
 * Consumer: AddToCartButton calls triggerFly.
 * Consumer: Navbar attaches cartIconRef to the cart <ShoppingBag> wrapper.
 */

export const CartAnimationContext = createContext({
  cartIconRef: { current: null },
  triggerFly: () => {},
  flyState: null,
  clearFly: () => {},
});

export const useCartAnimationContext = () => useContext(CartAnimationContext);