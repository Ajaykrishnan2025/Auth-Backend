// 📁 server/routes/userRoutes.js
import express from "express";
import { getUserData } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router(); // ✅ You forgot this line

router.get("/data", authMiddleware, getUserData);

export default router;
