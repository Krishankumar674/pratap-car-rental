const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // ✅ Setup Gmail transporter using App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail ID
        pass: process.env.EMAIL_PASS, // App password from Google
      },
    });

    // ✅ Email content
    const mailOptions = {
      from: `"Pratap Car Rental" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // admin inbox
      subject: `📩 New Contact Message: ${subject || "No subject"}`,
      html: `
        <h3>New Contact Message from Website</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject || "N/A"}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
        <hr />
        <p style="color:gray">This message was sent from Pratap Car Rental Contact Page</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "✅ Message sent successfully!" });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
});

module.exports = router;
