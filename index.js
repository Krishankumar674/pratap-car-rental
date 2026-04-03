require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ Serve uploaded images folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB connection error:", err));

// ✅ API Routes — keep these BEFORE serving static files
app.use("/api/auth", require("./routes/auth"));
app.use("/api/cars", require("./routes/cars"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/admin", require("./routes/admin")); // 👈 VERY IMPORTANT
app.use("/api/contact", require("./routes/contact"));




// ✅ Serve frontend static files (after API routes)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root test
app.get("/", (req, res) => {
  res.send("🚗 Car Rental Backend is running 💨");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
