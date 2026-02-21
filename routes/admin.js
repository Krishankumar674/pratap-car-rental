const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { auth, adminOnly } = require("../middlewares/auth");
const Car = require("../models/Car");
const Booking = require("../models/Booking");
const User = require("../models/User");

// ✅ MULTER STORAGE - Absolute Correct Path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ✅ Dashboard Stats
router.get("/dashboard", auth, adminOnly, async (req, res) => {
  try {
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: "Confirmed" });

    res.json({ totalCars, totalBookings, totalUsers, activeBookings });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Add new car with image
router.post("/upload-car", auth, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { name, brand, seats, pricePerDay } = req.body;
    if (!req.file) return res.status(400).json({ msg: "Image required" });

    const car = new Car({
      name,
      brand,
      seats,
      pricePerDay,
      image: "uploads/" + req.file.filename,
    });

    await car.save();
    res.json({ msg: "✅ Car added successfully", car });

  } catch (err) {
    res.status(500).json({ msg: "❌ Error adding car", error: err.message });
  }
});

// ✅ Delete Car
router.delete("/cars/:id", auth, adminOnly, async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.json({ msg: "🗑️ Car deleted" });
});

// ✅ Get All Cars
router.get("/cars", auth, adminOnly, async (req, res) => {
  const cars = await Car.find();
  res.json(cars);
});

// ✅ Bookings
router.get("/bookings", auth, adminOnly, async (req, res) => {
  const bookings = await Booking.find().populate("carId userId");
  res.json(bookings);
});

// ✅ Update booking status
router.patch("/bookings/:id", auth, adminOnly, async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(updated);
});

// ✅ Get Users
router.get("/users", auth, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// ✅ Admin Login
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ email });

  if (!admin) return res.status(400).json({ msg: "Admin not found" });
  if (admin.role !== "admin") return res.status(403).json({ msg: "Not an admin" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

module.exports = router;
