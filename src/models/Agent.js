const mongoose = require('mongoose');

/**
 * Agent Performance Schema
 * Tracks individual agent performance metrics
 */
const agentSchema = new mongoose.Schema(
  {
    // Agent identifier
    name: {
      type: String,
      required: [true, 'Agent name is required'],
      trim: true,
      maxlength: [255, 'Name cannot exceed 255 characters'],
      index: true,
    },

    // Date of performance record
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Time metrics (in seconds)
    talkTime: {
      type: Number,
      default: 0,
      min: [0, 'Talk time cannot be negative'],
    },
    loggedInTime: {
      type: Number,
      default: 0,
      min: [0, 'Logged in time cannot be negative'],
    },
    breakTime: {
      type: Number,
      default: 0,
      min: [0, 'Break time cannot be negative'],
    },

    // Calculated performance score
    performanceScore: {
      type: Number,
      default: 0,
      min: [0, 'Performance score cannot be negative'],
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Disable __v field
  }
);

// Indexes for efficient querying
// Compound index for name and date queries
agentSchema.index({ name: 1, date: -1 });

// Index for performance score leaderboard queries
agentSchema.index({ performanceScore: -1, date: -1 });

// TTL index to auto-delete records older than 1 year (optional)
agentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

// Instance methods
agentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Agent', agentSchema);
