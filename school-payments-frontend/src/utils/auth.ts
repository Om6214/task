// utils/auth.js
import {jwtDecode} from "jwt-decode";

export const isTokenExpired = (token: string) => {
  if (!token) return true;

  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (typeof decoded.exp !== "number") return true; // treat as expired if exp is missing
    return decoded.exp * 1000 < Date.now(); // exp is in seconds, Date.now is ms
  } catch (e: any) {
    return true; // if decoding fails, treat as expired
  }
};

export const getToken = () => localStorage.getItem("token");

export const removeToken = () => localStorage.removeItem("token");
