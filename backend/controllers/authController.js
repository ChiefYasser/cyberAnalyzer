import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Setup for Gmail (you can change this to any SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "analyst",
    });

    await newUser.save();

    // Send welcome email
    await transporter.sendMail({
      from: `"Cyber Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Cyber Platform ",
      html: `
        <h2>Welcome, ${username}!</h2>
        <p>Your account has been created successfully.</p>
        <p>You can now log in and start using the platform.</p>
        <br />
        <a href="${process.env.FRONTEND_URL}/login"
           style="background:#0ea5e9;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;">
           Go to Login
        </a>
        <br /><br />
        <p style="font-size:12px;color:gray;">If you didn’t register, please ignore this email.</p>
      `,
    });

    // Generate token (optional — to auto-login)
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Registration successful. Welcome email sent!",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN USER (unchanged)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
