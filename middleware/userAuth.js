// 📁 server/middleware/userAuth.js
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please log in again.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.id) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please log in again.",
        });
      }

      req.userId = decoded.id;
    } catch (err) {
      console.error("🔥 JWT verification error in userAuth:", err);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    next();
  } catch (error) {
    console.error("🔥 Unexpected userAuth error:", error);
    res.status(500).json({ success: false, message: "Server error during auth check" });
  }
};

export default userAuth;
