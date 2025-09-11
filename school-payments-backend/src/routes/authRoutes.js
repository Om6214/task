import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword
} from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
  validateEmail,
  validateOTP,
  validatePassword,
  sanitizeInputs
} from "../middleware/validation.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInputs);

router.post("/register", validateRegister, registerUser);
router.post("/verify-email", validateOTP, verifyEmail);
router.post("/resend-verification", validateEmail, resendVerification);
router.post("/login", validateLogin, loginUser);
router.post("/forgot-password", validateEmail, forgotPassword);
router.post("/reset-password", validatePassword, resetPassword);
router.patch("/change-password", protect, validatePassword, changePassword);

export default router;