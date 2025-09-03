const Session = require("../models/session");

// @desc    Create a new session
// @route   POST /api/sessions
exports.createSession = async (req, res) => {
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
};

// @desc    Get all sessions for authenticated speaker
// @route   GET /api/sessions
exports.getSpeakerSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ speaker: req.user.id }).sort({
      scheduledFor: -1,
    });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching sessions." });
  }
};

// @desc    Get specific session by session code
// @route   GET /api/sessions/:sessionCode
exports.getSessionByCode = async (req, res) => {
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
};

// @desc    Start a session
// @route   PATCH /api/sessions/:sessionCode/start
exports.startSession = async (req, res) => {
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
};

// @desc    End a session
// @route   PATCH /api/sessions/:sessionCode/end
exports.endSession = async (req, res) => {
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
    // Note: You'll need to handle socket emission - pass io instance to controller
    // io.to(req.params.sessionCode).emit("session-ended");
    res.status(200).json({ message: "Session ended.", session });
  } catch (error) {
    res.status(500).json({ message: "Server error ending session." });
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
exports.deleteSession = async (req, res) => {
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
};

// @desc    Update a session
// @route   PUT /api/sessions/:id
exports.updateSession = async (req, res) => {
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
};

// @desc    Join a session (public route)
// @route   POST /api/sessions/join
exports.joinSession = async (req, res) => {
  try {
    const { sessionCode } = req.body;
    const session = await Session.findOne({ sessionCode });
    if (!session)
      return res.status(404).json({ message: "Session not found." });

    if (session.status !== "active") {
      return res.status(403).json({ message: "This session is not live yet." });
    }
    res
      .status(200)
      .json({ message: "Session joined.", sessionCode: session.sessionCode });
  } catch (error) {
    res.status(500).json({ message: "Server error joining session." });
  }
};

// @desc    Get public session info by session code
// @route   GET /api/sessions/public/:sessionCode
exports.getPublicSession = async (req, res) => {
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
};
