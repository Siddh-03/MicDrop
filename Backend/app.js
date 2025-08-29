// 1. IMPORTS
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const http = require("http"); // NEW: Required for socket.io
const { Server } = require("socket.io"); // NEW: Socket.IO server

const User = require("./models/user");
const Session = require("./models/session");

// 2. INITIALIZE APP & SETTINGS
const app = express();
const port = 3000; // As requested
const JWT_SECRET = "your_super_secret_string";

const server = http.createServer(app); // NEW: Create HTTP server for Express
const io = new Server(server, {
  // NEW: Attach Socket.IO to the server
  cors: {
    origin: "http://localhost:8080", // As requested
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 3. MIDDLEWARE
app.use(
  cors({
    origin: "http://localhost:8080", // As requested
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

// 5. AUTHENTICATION MIDDLEWARE (No changes)
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

// --- USER AUTH ROUTES (No changes) ---
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

// --- SESSION ROUTES ---
app.post("/api/sessions", authMiddleware, async (req, res) => {
  try {
    const { title, scheduledFor, gracePeriod } = req.body;
    const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newSession = new Session({
      title,
      scheduledFor,
      gracePeriod,
      sessionCode,
      speaker: req.user.id,
      status: "upcoming",
    });
    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ message: "Server error creating session." });
  }
});

app.get("/api/sessions", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find({ speaker: req.user.id }).sort({
      scheduledFor: -1,
    });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching sessions." });
  }
});

// NEW: SPEAKER-ONLY route to get a single session's details
app.get("/api/sessions/:sessionCode", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findOne({
      sessionCode: req.params.sessionCode,
    });
    if (!session)
      return res.status(404).json({ message: "Session not found." });
    if (session.speaker.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized." });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching session." });
  }
});

app.patch(
  "/api/sessions/:sessionCode/start",
  authMiddleware,
  async (req, res) => {
    try {
      const session = await Session.findOne({
        sessionCode: req.params.sessionCode,
      });
      if (!session)
        return res.status(404).json({ message: "Session not found." });
      if (session.speaker.toString() !== req.user.id)
        return res.status(403).json({ message: "Not authorized." });
      if (session.status !== "upcoming")
        return res
          .status(400)
          .json({ message: "Session already started or completed." });

      session.status = "active";
      await session.save();
      res.status(200).json({ message: "Session started.", session });
    } catch (error) {
      res.status(500).json({ message: "Server error starting session." });
    }
  }
);

app.patch(
  "/api/sessions/:sessionCode/end",
  authMiddleware,
  async (req, res) => {
    try {
      const session = await Session.findOne({
        sessionCode: req.params.sessionCode,
      });
      if (!session)
        return res.status(404).json({ message: "Session not found." });
      if (session.speaker.toString() !== req.user.id)
        return res.status(403).json({ message: "Not authorized." });
      if (session.status !== "active")
        return res.status(400).json({ message: "Session is not active." });

      session.status = "completed";
      await session.save();
      // NEW: Notify all clients in the room that the session has ended
      io.to(req.params.sessionCode).emit("session-ended");
      res.status(200).json({ message: "Session ended.", session });
    } catch (error) {
      res.status(500).json({ message: "Server error ending session." });
    }
  }
);

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

// --- PUBLIC ROUTES FOR AUDIENCE ---
app.post("/api/sessions/join", async (req, res) => {
  try {
    const { sessionCode } = req.body;
    const session = await Session.findOne({ sessionCode });
    if (!session)
      return res.status(404).json({ message: "Session not found." });

    // MODIFIED: Only allow joining if session is 'active'
    if (session.status !== "active") {
      return res.status(403).json({ message: "This session is not live yet." });
    }
    res
      .status(200)
      .json({ message: "Session joined.", sessionCode: session.sessionCode });
  } catch (error) {
    res.status(500).json({ message: "Server error joining session." });
  }
});

app.get("/api/sessions/public/:sessionCode", async (req, res) => {
  try {
    const session = await Session.findOne({
      sessionCode: req.params.sessionCode,
    }).select("title status scheduledFor gracePeriod");
    if (!session)
      return res.status(404).json({ message: "Session not found." });
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching session." });
  }
});

// --- NEW: REAL-TIME SOCKET.IO LOGIC ---
const sessionStats = {}; // In-memory store for live data

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-session", (sessionCode) => {
    socket.join(sessionCode);

    if (!sessionStats[sessionCode]) {
      sessionStats[sessionCode] = { audience: 0, positive: 0, negative: 0 };
    }
    sessionStats[sessionCode].audience++;

    // Broadcast updated stats to the speaker's room
    io.to(sessionCode).emit("update-stats", sessionStats[sessionCode]);
    socket.data.sessionCode = sessionCode; // Store sessionCode for disconnect
  });

  socket.on("submit-vote", ({ sessionCode, voteType }) => {
    if (sessionStats[sessionCode]) {
      if (voteType === "positive") {
        sessionStats[sessionCode].positive++;
      } else if (voteType === "negative") {
        sessionStats[sessionCode].negative++;
      }
      io.to(sessionCode).emit("update-stats", sessionStats[sessionCode]);
    }
  });

  socket.on("disconnect", () => {
    const { sessionCode } = socket.data;
    if (sessionCode && sessionStats[sessionCode]) {
      sessionStats[sessionCode].audience--;
      io.to(sessionCode).emit("update-stats", sessionStats[sessionCode]);
    }
    console.log("A user disconnected:", socket.id);
  });
});

// 8. START SERVER
// MODIFIED: Use `server.listen` instead of `app.listen`
server.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
