const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, department, role } = req.body;

    if (!fullName || !email || !password || !department) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      department,
      role: role || "student",
    });

    await user.save();

    req.session.userId = user._id;
    req.session.userRole = user.role;

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    req.session.userId = user._id;
    req.session.userRole = user.role;

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  User.findById(req.session.userId)
    .select("-password")
    .then((user) => {
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      res.json({ success: true, user });
    })
    .catch(() => res.status(500).json({ success: false, message: "Server error" }));
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
});

module.exports = router;
