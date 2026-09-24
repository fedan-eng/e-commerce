import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  lastAddedItem: null, // { name, image, color, price } — shown in the "Added to cart" banner
  showBanner: false,   // green "Added to cart" banner at top of sidebar
};

const cartUISlice = createSlice({
  name: "cartUI",
  initialState,
  reducers: {
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
      state.showBanner = false;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
      if (!state.isOpen) state.showBanner = false;
    },
    itemAdded: (state, action) => {
      // Called after the fly animation lands
      state.isOpen = true;
      state.showBanner = true;
      state.lastAddedItem = action.payload; // { name, image, color, price }
    },
    dismissBanner: (state) => {
      state.showBanner = false;
    },
  },
});

export const { openCart, closeCart, toggleCart, itemAdded, dismissBanner } =
  cartUISlice.actions;

export default cartUISlice.reducer;