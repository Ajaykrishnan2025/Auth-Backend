import nodemailer from "nodemailer";
import dotenv from "dotenv";

// ✅ Load environment variables here too
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  },
  
  tls: {
    rejectUnauthorized: false,
  },
});

// ✅ Debug print to confirm loaded values
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("SMTP_PASS =", process.env.SMTP_PASS ? "✅ Loaded" : "❌ Missing");

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error.message);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

export default transporter;
