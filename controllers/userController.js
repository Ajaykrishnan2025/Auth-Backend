import userModel from "../models/UserModel.js";

// ✅ Controller to get user details after authentication
export const getUserData = async (req, res) => {
  try {
    // req.userId is set by authMiddleware after verifying token
    const user = await userModel
      .findById(req.userId)
      .select("name email isAccountVerified");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Success response
    res.status(200).json({
      success: true,
      userData: user,
    });
  } catch (error) {
    console.error("Error in getUserData:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
