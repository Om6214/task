// src/services/authApi.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth", // change to your backend URL
});

const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    API.post("/register", data),
  login: (data: { email: string; password: string }) =>
    API.post("/login", data),
  verifyEmail: (data: { email: string; otp: string }) =>
    API.post("/verify-email", data),
  resendVerification: (data: { email: string }) =>
    API.post("/resend-verification", data),
  forgotPassword: (data: { email: string }) =>
    API.post("/forgot-password", data),
  resetPassword: (data: { email: string; otp: string; password: string }) =>
    API.post("/reset-password", data),
  changePassword: (data: { currentPassword: string; newPassword: string }, token: string) =>
    API.patch("/change-password", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default authApi;
