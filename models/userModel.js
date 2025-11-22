import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Basic info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Email verification
  otp: { type: String, default: "" }, // ✅ used for both email verification & reset
  isAccountVerified: { type: Boolean, default: false }, // ✅ matches controller

  // Password reset
  resetOtp: { type: String, default: "" },
  resetOtpExpires: { type: Date },
}, { timestamps: true }); // ⏰ adds createdAt & updatedAt automatically

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
