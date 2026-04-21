const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['employee', 'admin'],
      default: 'employee',
    },
    department: {
      type: String,
      default: 'Sales',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    avatar: String,
  },
  {
    timestamps: true,
  }
);

// ✅ PRODUCTION-LEVEL: Normalize email before saving (case-insensitive)
employeeSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
  }
  if (this.name) {
    this.name = this.name.trim();
  }
  next();
});

// ✅ Virtual for displaying employee info
employeeSchema.virtual('displayName').get(function() {
  return this.name;
});

module.exports = mongoose.model('Employee', employeeSchema);
