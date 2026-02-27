//authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch current user info
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: 'include', // ✅ Important for cookies
      });
      const data = await res.json();
      
      // ✅ Don't treat 401 as an error - just means not logged in
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) throw new Error(data.message);
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
        credentials: 'include', // ✅ Include cookies
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      return data.user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: 'include', // ✅ Include cookies
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

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
        // ✅ Handle null return (401 case)
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null; // ✅ Clear user on error
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