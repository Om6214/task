import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  });
};

// Register user
export const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email"
      });
    }

    // Create new user
    const newUser = await User.create({
      email,
      password,
      name
    });

    // Generate verification token
    const verificationToken = newUser.createVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(newUser, verificationToken);

      res.status(201).json({
        status: "success",
        message: "Verification OTP sent to your email",
        data: {
          userId: newUser._id
        }
      });
    } catch (error) {
      console.error("Verification email error:", error); // <-- Add this line
      // If email fails, delete the user
      await User.findByIdAndDelete(newUser._id);

      return res.status(500).json({
        message: "There was an error sending the verification email. Try again later.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Verify email with OTP (by email instead of userId)
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP matches
    if (user.verificationToken !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP expired
    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Email verified successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// Resend verification OTP
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      status: "success",
      message: "Verification OTP resent to your email"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email first",
        needsVerification: true,
        userId: user._id
      });
    }

    // Update last login and reset login attempts
    user.lastLogin = Date.now();
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });

    // If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Get user based on POSTed email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "There is no user with that email address" });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send it to user's email
    try {
      await sendPasswordResetEmail(user, resetToken);

      res.status(200).json({
        status: "success",
        message: "Password reset OTP sent to email"
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        message: "There was an error sending the email. Try again later.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Get user based on the token
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }

    // Set the new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Update changedPasswordAt property for the user
    // Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user from collection
    const user = await User.findById(userId).select("+password");

    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({ message: "Your current password is wrong" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};