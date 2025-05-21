import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
import { redis } from "@/services/redis";

// Setup your transporter (e.g., SMTP from Supabase SMTP or any provider)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Send OTP Email
export const sendOtpEmail = async (to: string) => {
  try {
    // Check if OTP already exists in Redis for this email
    const existingOtp = await redis.get(to);

    if (existingOtp) {
      // OTP exists and still valid (because Redis key not expired yet)
      throw new Error("OTP already sent. Please try again after 5 minutes.");
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    const templatePath = path.join(
      process.cwd(),
      "src/helpers/emailTemplate.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      otp,
      name: to,
    });

    await transporter.sendMail({
      from: `"Periskope" <${process.env.SMTP_USER}>`,
      to,
      subject: `${otp} - OTP to login to Periskope`,
      html,
    });

    // Store OTP in Redis with 5 minutes expiry (300 seconds)
    await redis.set(to, otp, "EX", 300);
    // expire in 300 seconds (5 minutes)

    return { success: true };
  } catch (error: any) {
    console.error("Error sending OTP email:", error.message || error);
    return { success: false, message: error.message || "Failed to send OTP" };
  }
};

//Verify OTP
export const verifyOtp = async (email: string, otp: string) => {
  try {
    // Get OTP from Redis
    const storedOtp = await redis.get(email);

    if (!storedOtp) {
      return {
        success: false,
        message: "OTP expired or not found. Please request a new one.",
      };
    }

    if (storedOtp !== otp) {
      return { success: false, message: "Invalid OTP. Please try again." };
    }

    // OTP matches, delete it so it can't be reused
    // await redis.del(email);

    return { success: true, message: "OTP verified successfully." };
  } catch (error: any) {
    console.error("Error verifying OTP:", error.message || error);
    return { success: false, message: "Failed to verify OTP" };
  }
};
