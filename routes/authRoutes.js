import express from "express";
import {
  sendVerifyOtp,
  logout,
  register,
  login,
  verifyAccount,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// ✅ Register & Login
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// ✅ Email verification
router.post("/send-verify-otp", sendVerifyOtp);  // 👈 missing route added here
router.post("/verify-account", verifyAccount);

// ✅ Auth check
router.get("/is-auth", userAuth, isAuthenticated);

// ✅ Forgot password
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

export default router;
