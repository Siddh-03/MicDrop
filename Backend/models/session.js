const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  sessionCode: {
    type: String,
    required: true,
    unique: true,
  },
  speaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming', // Default status when a session is created
  },
  scheduledFor: {
    type: Date,
    required: true,
  },
  gracePeriod: {
    type: Number, // Storing as a number of minutes
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Session', sessionSchema);
