require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/cars", require("./routes/cars"));
const bookingRoutes = require("./routes/bookings");
app.use("/api/bookings", bookingRoutes);

// ✅ Static Folder
app.use(express.static("public"));

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("🚗 Car Rental API is running successfully!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
