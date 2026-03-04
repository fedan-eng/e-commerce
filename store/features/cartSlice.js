// store/features/cartSlice.js
// Same as before + syncs to DB on every change for logged-in users

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existing = state.items.find(
        (item) => item._id === newItem._id && item.color === newItem.color
      );
      if (existing) {
        existing.quantity += newItem.quantity;
      } else {
        state.items.push({ ...newItem });
      }
    },
    removeFromCart: (state, action) => {
      const { _id, color } = action.payload;
      state.items = state.items.filter(
        (item) => !(item._id === _id && item.color === color)
      );
    },
    updateQuantity: (state, action) => {
      const { _id, color, quantity } = action.payload;
      const item = state.items.find(
        (item) => item._id === _id && item.color === color
      );
      if (item) item.quantity = quantity;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;


// ─────────────────────────────────────────────────────────────────────────────
// Cart sync middleware — add this to your store.js (see below)
// It runs after every cart action and POSTs to /api/cart/sync
// ─────────────────────────────────────────────────────────────────────────────

let syncTimer = null;

export const cartSyncMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Only sync on cart actions
  const cartActions = ["cart/addToCart", "cart/removeFromCart", "cart/updateQuantity", "cart/clearCart"];
  if (!cartActions.includes(action.type)) return result;

  // Debounce — wait 800ms after last cart change before syncing
  // This prevents hammering the API when user adjusts quantity rapidly
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const { items } = store.getState().cart;

    // Fire and forget — don't block the UI
    fetch("/api/cart/sync", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ items }),
    }).catch((err) => console.error("Cart sync failed:", err));
  }, 800);

  return result;
};