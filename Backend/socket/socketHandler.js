const sessionStats = {}; // In-memory store for stats

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-session", (sessionCode) => {
      socket.join(sessionCode);
      socket.data.sessionCode = sessionCode;

      if (!sessionStats[sessionCode]) {
        sessionStats[sessionCode] = {
          audience: 0,
          positive: 0,
          negative: 0,
          voters: {},
        };
      }
      sessionStats[sessionCode].audience++;

      console.log(
        `[Server] User ${socket.id} joined room ${sessionCode}. Emitting stats:`,
        sessionStats[sessionCode]
      );
      io.to(sessionCode).emit("update-stats", sessionStats[sessionCode]);
    });

    socket.on("submit-vote", ({ sessionCode, voteType }) => {
      const stats = sessionStats[sessionCode];
      if (!stats) return;

      const voterId = socket.id;
      const previousVote = stats.voters[voterId];

      if (previousVote === voteType) {
        console.log(
          `[Server] User ${voterId} voted for the same category again. No change.`
        );
        return;
      }

      if (previousVote) {
        if (previousVote === "positive") stats.positive--;
        if (previousVote === "negative") stats.negative--;
      }

      if (voteType === "positive") stats.positive++;
      if (voteType === "negative") stats.negative++;

      stats.voters[voterId] = voteType;

      console.log(
        `[Server] Vote from ${voterId} processed. Emitting stats:`,
        stats
      );
      io.to(sessionCode).emit("update-stats", stats);
    });

    socket.on("disconnect", () => {
      const { sessionCode } = socket.data;
      const stats = sessionStats[sessionCode];
      if (!stats) return;

      const voterId = socket.id;
      const previousVote = stats.voters[voterId];

      if (previousVote) {
        if (previousVote === "positive") stats.positive--;
        if (previousVote === "negative") stats.negative--;
        delete stats.voters[voterId];
      }
      stats.audience--;

      if (stats.audience <= 0) {
        console.log(
          `[Server] Last user left room ${sessionCode}. Deleting stats.`
        );
        delete sessionStats[sessionCode];
      } else {
        console.log(
          `[Server] User ${voterId} left room ${sessionCode}. Emitting stats:`,
          stats
        );
        io.to(sessionCode).emit("update-stats", stats);
      }
      console.log("A user disconnected:", socket.id);
    });
  });
};
