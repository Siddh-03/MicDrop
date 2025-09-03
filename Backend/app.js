// 1. IMPORTS & CONFIG
require("dotenv").config(); 
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

// Import Routes and Socket Handler
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const initializeSocket = require("./socket/socketHandler");

// 2. INITIALIZE APP & DATABASE
mongoose
  .connect("mongodb://localhost:27017/micdrop", {})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// 3. INITIALIZE SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Pass the io instance to the socket handler
initializeSocket(io);

// 4. MIDDLEWARE
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 5. MOUNT ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);

// 6. START SERVER
server.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});


