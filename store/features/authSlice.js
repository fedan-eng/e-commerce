// store/features/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setCartFromDB, clearCart } from "./cartSlice";
import { setWishlistFromDB, clearWishlist } from "./wishlistSlice";

// ─── Fetch current user ──────────────────────────────────────────────────────
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      const data = await res.json();

      // 401/403/404 → reject cleanly, don't treat as fulfilled
      if (!res.ok) return rejectWithValue(data.message || "Unauthorized");

      const user = data.user;

      // Guard: if server returned 200 but no user object, reject
      if (!user) return rejectWithValue("No user in response");

      // Load DB cart and wishlist into Redux (overwrites any stale localStorage)
      if (user.cart?.items?.length > 0) {
        dispatch(setCartFromDB(user.cart.items));
      }
      if (user.wishlist?.items?.length > 0) {
        dispatch(setWishlistFromDB(user.wishlist.items));
      }

      return user;
    } catch (error) {
      // Network-level failure (fetch itself threw)
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// ─── Update user profile ─────────────────────────────────────────────────────
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
      if (!res.ok) return rejectWithValue(data.message || "Update failed");
      return data.user;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// ─── Logout ──────────────────────────────────────────────────────────────────
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Logout failed");

      // Wipe cart and wishlist from Redux + localStorage immediately
      dispatch(clearCart());
      dispatch(clearWishlist());

      return true;
    } catch (err) {
      return rejectWithValue(err.message || "Network error");
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────
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
      // ── fetchUser ──────────────────────────────────────────────────────
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true; // only reaches here if user is real
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // ── updateUser ─────────────────────────────────────────────────────
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

      // ── logoutUser ─────────────────────────────────────────────────────
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        // Clear user immediately on logout start — don't wait for server
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.updateMessage = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUser } = authSlice.actions;
export default authSlice.reducer;