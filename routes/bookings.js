const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Car = require("../models/Car");

// ✅ Create booking
router.post("/", async (req, res) => {
  try {
    const { carId, name, email, phone, startDate, endDate } = req.body;

    if (!carId || !name || !email || !phone || !startDate || !endDate) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Check car exists
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ msg: "Car not found" });

    const booking = new Booking({
      carId,
      name,
      email,
      phone,
      startDate,
      endDate,
      status: "Pending",
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
