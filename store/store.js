import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import registerReducer from "./features/registerSlice";
import productReducer from "./features/productSlice";
import cartReducer from "./features/cartSlice";
import wishlistReducer from "./features/wishlistSlice";
import recentlyViewedReducer from "./features/recentlyViewedSlice";

// Load wishlist from localStorage (only on client)
const loadWishlist = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const serializedState = localStorage.getItem("wishlist");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    return undefined;
  }
};

// Save wishlist to localStorage
const saveWishlist = (state) => {
  if (typeof window === 'undefined') return;
  try {
    const serializedState = JSON.stringify(state.wishlist);
    localStorage.setItem("wishlist", serializedState);
  } catch (e) {}
};

// Load cart from localStorage (only on client)
const loadCart = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const serializedState = localStorage.getItem("cart");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    return undefined;
  }
};

// Save cart to localStorage
const saveCart = (state) => {
  if (typeof window === 'undefined') return;
  try {
    const serializedState = JSON.stringify(state.cart);
    localStorage.setItem("cart", serializedState);
  } catch (e) {}
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    register: registerReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    recentlyViewed: recentlyViewedReducer,
  },

  preloadedState: {
    cart: loadCart(),
    wishlist: loadWishlist(),
  },
});

store.subscribe(() => {
  const state = store.getState();
  saveCart(state);
  saveWishlist(state);
});
