// store/features/cartSlice.js

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
    updateColor: (state, action) => {
      const { _id, oldColor, newColor } = action.payload;
      const item = state.items.find(
        (item) => item._id === _id && item.color === oldColor
      );
      if (item) {
        // Check if an item with the same product and new color already exists
        const existingWithNewColor = state.items.find(
          (i) => i._id === _id && i.color === newColor
        );
        if (existingWithNewColor) {
          // Merge quantities
          existingWithNewColor.quantity += item.quantity;
          // Remove the old item
          state.items = state.items.filter(
            (i) => !(i._id === _id && i.color === oldColor)
          );
        } else {
          // Just update the color
          item.color = newColor;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    // ── Replaces the entire cart with items from DB ─────────────────────────
    // Called on login — overwrites localStorage cart with the user's real cart.
    setCartFromDB: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateColor,
  clearCart,
  setCartFromDB, // 👈 export it
} = cartSlice.actions;

export default cartSlice.reducer;


// ── Cart sync middleware ──────────────────────────────────────────────────────
// Fires after every cart mutation and POSTs to /api/cart/sync.
// setCartFromDB is excluded so loading from DB doesn't re-trigger a sync.

let syncTimer = null;

export const cartSyncMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  const syncActions = [
    "cart/addToCart",
    "cart/removeFromCart",
    "cart/updateQuantity",
    "cart/updateColor",
    "cart/clearCart",
    // ⚠️ cart/setCartFromDB is intentionally NOT here
    // We don't want to re-sync back to DB when we just loaded FROM the DB
  ];

  if (!syncActions.includes(action.type)) return result;

  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const { items } = store.getState().cart;
    fetch("/api/cart/sync", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ items }),
    }).catch((err) => console.error("Cart sync failed:", err));
  }, 800);

  return result;
};