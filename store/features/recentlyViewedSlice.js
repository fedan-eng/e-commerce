// recentlyViewedSlice.js
import { createSlice } from "@reduxjs/toolkit";

const MAX_ITEMS = 4;

const recentlyViewedSlice = createSlice({
  name: "recentlyViewed",
  initialState: {
    items: [], //
  },
  reducers: {
    addRecentlyViewed: (state, action) => {
      const product = action.payload;

      // Remove duplicate
      state.items = state.items.filter((p) => p._id !== product._id);

      // Add full product
      state.items.unshift(product);

      // Limit to MAX_ITEMS
      if (state.items.length > MAX_ITEMS) {
        state.items.pop();
      }

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("recentlyViewed", JSON.stringify(state.items));
      }
    },
    setRecentlyViewed: (state, action) => {
      state.items = action.payload;
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("recentlyViewed");
      }
    },
  },
});

export const { addRecentlyViewed, setRecentlyViewed, clearRecentlyViewed } =
  recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
