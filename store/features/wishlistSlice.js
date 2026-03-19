// store/features/wishlistSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const newItem = action.payload;
      const exists = state.items.some((item) => item._id === newItem._id);
      if (!exists) {
        state.items.push(newItem);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    // ✅ Load wishlist from DB on login
    setWishlistFromDB: (state, action) => {
      state.items = action.payload || [];
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, setWishlistFromDB } =
  wishlistSlice.actions;

// ✅ Sync middleware — fires after mutations, debounced 800ms
let syncTimeout = null;

const SYNC_ACTIONS = [
  "wishlist/addToWishlist",
  "wishlist/removeFromWishlist",
  "wishlist/clearWishlist",
];

export const wishlistSyncMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (SYNC_ACTIONS.includes(action.type)) {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      const items = store.getState().wishlist.items;
      fetch("/api/wishlist/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).catch(() => {}); // fire and forget
    }, 800);
  }

  return result;
};

export default wishlistSlice.reducer;