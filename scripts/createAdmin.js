// scripts/createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // <-- make sure this path is correct

(async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if already exists
    const existing = await User.findOne({ email: "admin@site.com" });
    if (existing) {
      console.log("⚠️ Admin already exists:", existing.email);
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    const admin = new User({
      name: "Admin",
      email: "admin@site.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin created successfully:", admin.email);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
})();
