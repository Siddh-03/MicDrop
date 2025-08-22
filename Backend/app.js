/*
 * ====================================================================
 * Backend with Auto-Status Update Logic
 * ====================================================================
 */

// 1. IMPORTS
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const Session = require("./models/session");

// 2. INITIALIZE APP & SETTINGS
const app = express();
const port = 3000;
const JWT_SECRET = "your_super_secret_string";

// 3. MIDDLEWARE
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 4. DATABASE CONNECTION
mongoose
  .connect("mongodb://localhost:27017/micdrop", {})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 5. AUTHENTICATION MIDDLEWARE
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid." });
  }
};

// 6. USER AUTH ROUTES (No changes here)
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res
        .status(400)
        .json({ message: "Username, email, and password are required." });
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res
        .status(409)
        .json({ message: "Username or email already exists." });
    const newUser = new User({ username, email, password });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error during signup." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
});

app.post("/api/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logout successful." });
});

app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// 7. SESSION ROUTES
app.post("/api/sessions", authMiddleware, async (req, res) => {
  try {
    const { title, scheduledFor, gracePeriod } = req.body;
    if (!title || !scheduledFor || !gracePeriod) {
      return res
        .status(400)
        .json({ message: "All session fields are required." });
    }
    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newSession = new Session({
      title,
      scheduledFor,
      gracePeriod,
      sessionCode,
      speaker: req.user.id,
    });
    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating session." });
  }
});

app.get("/api/sessions", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ speaker: req.user.id }).sort({
      scheduledFor: 1,
    });

    // --- NEW: Auto-update status logic ---
    const now = new Date();
    const updatedSessions = await Promise.all(
      sessions.map(async (session) => {
        if (
          session.status === "upcoming" &&
          new Date(session.scheduledFor) < now
        ) {
          session.status = "completed";
          await session.save();
        }
        return session;
      })
    );

    res.status(200).json(updatedSessions);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching sessions." });
  }
});

app.delete("/api/sessions/:id", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session)
      return res.status(404).json({ message: "Session not found." });
    if (session.speaker.toString() !== req.user.id)
      return res.status(403).json({ message: "User not authorized." });
    await session.deleteOne();
    res.status(200).json({ message: "Session deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting session." });
  }
});

app.put("/api/sessions/:id", authMiddleware, async (req, res) => {
  try {
    const { title, scheduledFor, gracePeriod } = req.body;
    if (!title || !scheduledFor || !gracePeriod) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const session = await Session.findById(req.params.id);
    if (!session)
      return res.status(404).json({ message: "Session not found." });
    if (session.speaker.toString() !== req.user.id)
      return res.status(403).json({ message: "User not authorized." });
    if (session.status !== "upcoming")
      return res
        .status(400)
        .json({ message: "Only upcoming sessions can be updated." });

    session.title = title;
    session.scheduledFor = scheduledFor;
    session.gracePeriod = gracePeriod;
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error while updating session." });
  }
});

// 8. START SERVER
app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
