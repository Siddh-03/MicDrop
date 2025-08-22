const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  scheduledFor: {
    type: Date,
    required: true,
  },
  // NEW: Field to store the grace period
  gracePeriod: {
    type: String,
    required: true,
  },
  sessionCode: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming',
  },
  speaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
