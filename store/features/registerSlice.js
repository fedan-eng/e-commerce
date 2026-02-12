import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser, verifyCode } from "@/lib/auth"; // adjust your path

// Async Thunks
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

export const verifyCodeAsync = createAsyncThunk(
  "auth/verifyCode",
  async ({ code, email }, { rejectWithValue }) => {
    try {
      const response = await verifyCode({ code, email });
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
    isVerified: false,
    error: null,
    successMessage: "",
    email: "",
  },
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRegistered = true;
        state.email = action.payload.email;
        state.successMessage =
          "Registration successful. Check your email for a verification code.";
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(verifyCodeAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyCodeAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isVerified = true;
        state.successMessage = "Email verified successfully.";
      })
      .addCase(verifyCodeAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setEmail } = registerSlice.actions;
export default registerSlice.reducer;
