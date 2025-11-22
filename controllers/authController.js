import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

/* ------------------ REGISTER ------------------ */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Missing details" });

    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      otp,
      isAccountVerified: false,
    });

    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Verify your email address 🔐",
        text: `Hello ${name},\n\nYour OTP for email verification is: ${otp}\n\nThis code will expire soon.\n\nThank you.`,
      });
    } catch (mailErr) {
      console.warn("Failed to send verification email:", mailErr.message);
    }

    return res.json({
      success: true,
      message: "Registered successfully! Please check your email for OTP verification.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

/* ------------------ SEND VERIFY OTP (Resend) ------------------ */
export const sendVerifyOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Missing email" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.isAccountVerified)
      return res.status(400).json({ success: false, message: "Email already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Resend OTP - Verify your email 🔐",
      text: `Hello ${user.name},\n\nYour new OTP for email verification is: ${otp}\n\nThis code will expire soon.\n\nThank you.`,
    });

    return res.json({ success: true, message: "New OTP sent to your email" });
  } catch (error) {
    console.error("Send Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error sending OTP" });
  }
};

/* ------------------ LOGIN ------------------ */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid password" });

    if (!user.isAccountVerified)
      return res.status(403).json({ success: false, message: "Please verify your email before login" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

res.cookie("token", token, {
  httpOnly: true,
  secure: true,       // ✅ HTTPS required
  sameSite: "None",   // ✅ allow cross-domain (Vercel frontend)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});


    return res.json({ success: true, message: "Login successful", userId: user._id });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
};

/* ------------------ LOGOUT ------------------ */
export const logout = async (req, res) => {
  try {
res.cookie("token", token, {
  httpOnly: true,
  secure: true,       // ✅ HTTPS required
  sameSite: "None",   // ✅ allow cross-domain (Vercel frontend)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Server error during logout" });
  }
};


/* ------------------ VERIFY ACCOUNT ------------------ */
export const verifyAccount = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Missing details" });

    email = email.trim().toLowerCase();
    otp = String(otp).trim();

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (String(user.otp).trim() !== String(otp).trim())
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    // Mark verified
    user.isAccountVerified = true;
    user.otp = "";
    await user.save();

    // ⭐ NEW: Create token after successful verification
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ⭐ Send token in cookie (same as login)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Email verified successfully",
      token,
      userId: user._id
    });

  } catch (error) {
    console.error("Verify Account Error:", error);
    return res.status(500).json({ success: false, message: "Server error during verification" });
  }
};


/* ------------------ IS AUTHENTICATED ------------------ */
export const isAuthenticated = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token found" });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("🔥 JWT verification error in isAuthenticated:", err);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("🔥 Unexpected isAuthenticated error:", error);
    return res.status(500).json({ success: false, message: "Server error during auth check" });
  }
};




/* ------------------ FIXED: SEND RESET OTP ------------------ */
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 min expiry
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset OTP 🔒",
      html: `
        <h2>Hello ${user.name},</h2>
        <p>Your password reset OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for <b>15 minutes</b>.</p>
      `,
    });

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send Reset OTP Error:", error);
    return res.status(500).json({ success: false, message: "Server error sending reset OTP" });
  }
};

/* ------------------ FIXED: RESET PASSWORD ------------------ */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: "Missing details" });

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (String(user.resetOtp) !== String(otp))
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (user.resetOtpExpireAt < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = null;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error resetting password" });
  }
};
