// src/redux/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "@/services/authApi";

interface User {
  id?: string;
  email?: string;
  name?: string;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  needsVerification: boolean;
  message: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  needsVerification: false,
  message: null,
};

// Async thunks
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data: { email: string; password: string; name: string }, thunkAPI) => {
    try {
      const res = await authApi.register(data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await authApi.login(data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (data: { email: string; otp: string }, thunkAPI) => {
    try {
      const res = await authApi.verifyEmail(data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Verification failed");
    }
  }
);

export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async (data: { email: string }, thunkAPI) => {
    try {
      const res = await authApi.resendVerification(data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to resend verification");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: { email: string }, thunkAPI) => {
    try {
      const res = await authApi.forgotPassword(data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to send reset email");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: { email: string; otp: string; password: string }, thunkAPI) => {
    try {
      const res = await authApi.resetPassword(data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Password reset failed");
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: { currentPassword: string; newPassword: string }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const res = await authApi.changePassword(data, token || "");
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Password change failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.needsVerification = false;
      state.error = null;
      state.message = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.needsVerification = true;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.data.user;
        state.error = null;
        state.message = "Login successful";
        state.needsVerification = false;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
        
        // Check if the error indicates that verification is needed
        if (action.payload && typeof action.payload === 'string' && 
            action.payload.includes("verify your email")) {
          state.needsVerification = true;
        }
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.needsVerification = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
      })
      // Resend Verification
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resendVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.message = null;
      });
  },
});

export const { logout, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;