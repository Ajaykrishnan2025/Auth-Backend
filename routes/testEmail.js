// 📁 server/routes/testEmail.js
import express from "express";
import transporter from "../config/nodemailer.js";

const router = express.Router();

router.get("/send-test", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: "YOUR_EMAIL@gmail.com",
      subject: "Test Email from Brevo",
      text: "Hello Ajay! This is a test email from your Node.js backend.",
    });
    res.send("✅ Email sent successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to send email");
  }
});

export default router;
