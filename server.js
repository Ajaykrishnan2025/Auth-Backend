// server/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import testEmailRoutes from "./routes/testEmail.js";
import chatRouter from "./routes/chatRoutes.js";

dotenv.config();

const app = express();

// --------------------------
// CONNECT MONGO
// --------------------------
connectDB();

// --------------------------
// CORS FIX (LOCAL + VERCEL)
// --------------------------
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Required middlewares
app.use(express.json());
app.use(cookieParser());

// --------------------------
// ROUTES
// --------------------------
app.get("/", (req, res) => {
  res.send("API working fine!");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/test", testEmailRoutes);
app.use("/api/chat", chatRouter);

// --------------------------
// START SERVER (LOCAL ONLY)
// --------------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
