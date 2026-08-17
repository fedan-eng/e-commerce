import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser } from "@/lib/auth";

// Async Thunk
export const registerUserAsync = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await registerUser(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const registerSlice = createSlice({
  name: "register",
  initialState: {
    isLoading: false,
    isRegistered: false,
    error: null,
    successMessage: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUserAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.isRegistered = true;
        state.successMessage = "Registration successful. Check your email for a verification link.";
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default registerSlice.reducer;
