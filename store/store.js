import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import registerReducer from "./features/registerSlice";
import productReducer from "./features/productSlice";
import cartReducer from "./features/cartSlice";
import wishlistReducer from "./features/wishlistSlice";
import recentlyViewedReducer from "./features/recentlyViewedSlice";
import { cartSyncMiddleware } from "./features/cartSlice";
import { wishlistSyncMiddleware } from "./features/wishlistSlice";

// Load wishlist from localStorage
const loadWishlist = () => {
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
  try {
    const serializedState = JSON.stringify(state.wishlist);
    localStorage.setItem("wishlist", serializedState);
  } catch (e) {}
};

// Load cart from localStorage
const loadCart = () => {
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

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartSyncMiddleware, wishlistSyncMiddleware),
});

store.subscribe(() => {
  const state = store.getState();
  saveCart(state);
  saveWishlist(state);
});