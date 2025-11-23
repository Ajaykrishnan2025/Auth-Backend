import express from "express";
import {
  sendVerifyOtp,
  logout,
  register,
  login,
  verifyAccount,
  isAuthenticated,
  sendResetOtp,
  resetPassword, // ✅ now exists in authController
} from "../controllers/authController.js";

const router = express.Router();

// ✅ Register & Login
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// ✅ Email verification
router.post("/send-verify-otp", sendVerifyOtp);
router.post("/verify-account", verifyAccount);

// ✅ Auth check
router.get("/is-auth", isAuthenticated);

// ✅ Forgot password
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

// ✅ Default export (fix for server.js import)
export default router;
