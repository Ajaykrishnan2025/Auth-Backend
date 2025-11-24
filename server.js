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
import User from "./models/userModel.js";

dotenv.config();

const app = express();

// --------------------------
// CONNECT MONGO
// --------------------------
connectDB();

// --------------------------
// CORS FIX (LOCAL + NETLIFY)
// --------------------------
const allowedOrigins = [
  "http://localhost:5173",                  // local dev
  "https://myaichatboot.netlify.app",      // Netlify frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,                 // ✅ allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],   // ✅ needed for cookies
  })
);

// --------------------------
// Required middlewares
// --------------------------
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
// START SERVER
// --------------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
