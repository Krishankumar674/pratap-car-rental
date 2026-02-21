// controllers/adminController.js
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Helper - create transporter (uses env vars)
const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 465,
    secure: process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === "true" : true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // app password for Gmail
    },
  });
};

// POST /api/admin/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const admin = await User.findOne({ email });
    if (!admin || admin.role !== "admin") {
      // respond success to avoid user enumeration but log
      return res.status(200).json({ msg: "If admin exists, reset email sent" });
    }

    // Generate token (plain for email), store hashed
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

    admin.resetPasswordToken = hashed;
    admin.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await admin.save();

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/admin/reset-password.html?token=${resetToken}&id=${admin._id}`;

    // send email
    const transporter = createTransport();
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: admin.email,
      subject: "Admin Password Reset - PRATAPCARRENTAL",
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.5;">
          <h2>Password reset request</h2>
          <p>You requested a password reset for admin panel. Click the button below to reset your password. This link is valid for 1 hour.</p>
          <p><a href="${resetUrl}" style="background:#ff6600;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ msg: "If admin exists, reset email sent" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ msg: "Server error sending reset email" });
  }
};

// POST /api/admin/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, id, password } = req.body;
    if (!token || !id || !password)
      return res.status(400).json({ msg: "Token, id and new password are required" });

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    // find admin with matching token and not expired
    const admin = await User.findOne({
      _id: id,
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
      role: "admin",
    });

    if (!admin) return res.status(400).json({ msg: "Invalid or expired token" });

    // hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);

    // clear reset fields
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();

    return res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};
