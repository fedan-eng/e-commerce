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