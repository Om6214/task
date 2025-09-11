import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
// Debug log to confirm env is loaded
console.log("SMTP_USER:", process.env.EMAIL_USER ? "Loaded ✅" : "Missing ❌");
console.log("SMTP_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");

// Create a single reusable transporter instance
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "omnathganapure9981@gmail.com",   // ✅ matches .env
    pass: "uyxawaqajllcrqzt"   // ✅ matches .env
  }
});

// Optional: verify connection when app starts
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP connection error:", err);
  } else {
    console.log("✅ SMTP server is ready to send messages");
  }
});

// Generic email sender function
const sendEmail = async (options) => {
  await transporter.sendMail({
    from: `"School Payment System" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

// Send verification email
export const sendVerificationEmail = async (user, token) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Email Verification</h2>
      <p>Hello ${user.name},</p>
      <p>Thank you for registering with our School Payment System. Please use the following OTP to verify your email address:</p>
      <div style="background-color: #f3f4f6; padding: 16px; text-align: center; margin: 20px 0;">
        <h1 style="margin: 0; color: #4F46E5; letter-spacing: 8px;">${token}</h1>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
      <br>
      <p>Best regards,<br>School Payment Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Verify Your Email Address",
    html,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (user, token) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Password Reset</h2>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
      <div style="background-color: #f3f4f6; padding: 16px; text-align: center; margin: 20px 0;">
        <h1 style="margin: 0; color: #4F46E5; letter-spacing: 8px;">${token}</h1>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <br>
      <p>Best regards,<br>School Payment Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html,
  });
};
