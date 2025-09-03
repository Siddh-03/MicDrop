const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createSession,
  getSpeakerSessions,
  getSessionByCode,
  startSession,
  endSession,
  deleteSession,
  updateSession,
  joinSession,
  getPublicSession,
} = require("../controllers/sessionController");

// Speaker-only routes (protected)
router.post("/", authMiddleware, createSession);
router.get("/", authMiddleware, getSpeakerSessions);
router.get("/:sessionCode", authMiddleware, getSessionByCode);
router.patch("/:sessionCode/start", authMiddleware, startSession);
router.patch("/:sessionCode/end", authMiddleware, endSession);
router.delete("/:id", authMiddleware, deleteSession);
router.put("/:id", authMiddleware, updateSession);

// Public routes for audience
router.post("/join", joinSession);
router.get("/public/:sessionCode", getPublicSession);

module.exports = router;