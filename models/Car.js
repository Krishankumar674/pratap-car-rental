const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: String,
  brand: String,
  seats: Number,
  pricePerDay: Number,
  image: String
});

module.exports = mongoose.model("Car", carSchema);
