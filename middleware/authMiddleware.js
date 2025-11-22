import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
       const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // ✅ Save the user ID for later use

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
