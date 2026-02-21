const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  email: String,
  phone: String,
  startDate: Date,
  endDate: Date,
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Booking", bookingSchema);
