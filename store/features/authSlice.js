// store/features/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setCartFromDB, clearCart } from "./cartSlice"; // 👈 import cart actions

// Fetch current user info
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // ── When user logs in, load their cart from DB ──────────────────────
      // This overwrites whatever is in localStorage with the DB cart,
      // so User B never sees User A's leftover cart items.
      if (data.user?.cart?.items?.length > 0) {
        dispatch(setCartFromDB(data.user.cart.items));
      }
      // ────────────────────────────────────────────────────────────────────

      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user details
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      return data.user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // ── On logout, wipe the cart from localStorage ──────────────────────
      // So the next user who logs in starts clean.
      dispatch(clearCart());
      // ────────────────────────────────────────────────────────────────────

      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  updateMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.updateMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateMessage = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload };
        state.updateMessage = "Profile updated successfully!";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.updateMessage = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.updateMessage = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearUser } = authSlice.actions;
export default authSlice.reducer;