const mongoose = require('mongoose');

/**
 * Upload History Schema
 * Tracks all Excel/CSV file uploads with metadata and results
 * Used to prevent duplicate uploads and maintain audit trail
 */
const uploadHistorySchema = new mongoose.Schema(
  {
    // File metadata
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    fileHash: {
      type: String,
      required: [true, 'File hash is required for duplicate detection'],
      index: true,
    },

    // Upload metadata
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: false,
      index: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    dataDate: {
      type: Date,
      required: [true, 'Data date must be specified'],
      index: true,
    },

    // Processing metadata
    status: {
      type: String,
      enum: ['processing', 'success', 'partial_success', 'failed'],
      default: 'processing',
      index: true,
    },
    recordsProcessed: {
      type: Number,
      default: 0,
      min: [0, 'Records processed cannot be negative'],
    },
    recordsSkipped: {
      type: Number,
      default: 0,
      min: [0, 'Records skipped cannot be negative'],
    },
    recordsFailed: {
      type: Number,
      default: 0,
      min: [0, 'Records failed cannot be negative'],
    },

    // Error tracking
    errors: [
      {
        row: Number,
        field: String,
        value: mongoose.Schema.Types.Mixed,
        reason: String,
      },
    ],

    // Data quality metrics
    format: {
      type: String,
      enum: ['xlsx', 'csv', 'xls'],
      required: true,
    },
    totalRowsInFile: {
      type: Number,
      min: [0, 'Total rows cannot be negative'],
    },
    validRowsCount: {
      type: Number,
      min: [0, 'Valid rows cannot be negative'],
    },

    // Deduplication tracking
    isDuplicate: {
      type: Boolean,
      default: false,
      index: true,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UploadHistory',
      index: true,
    },

    // Processing details
    processingTime: {
      type: Number, // milliseconds
      default: 0,
      min: [0, 'Processing time cannot be negative'],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false,
  }
);

// Indexes for common queries
uploadHistorySchema.index({ uploadedBy: 1, uploadDate: -1 });
uploadHistorySchema.index({ dataDate: 1 });
uploadHistorySchema.index({ status: 1, uploadDate: -1 });
uploadHistorySchema.index({ fileHash: 1, dataDate: 1 }); // For duplicate detection

// Methods
uploadHistorySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Calculate success rate
uploadHistorySchema.methods.getSuccessRate = function () {
  const total = this.recordsProcessed + this.recordsSkipped + this.recordsFailed;
  if (total === 0) return 0;
  return ((this.recordsProcessed / total) * 100).toFixed(2);
};

// Static method to check for duplicates by hash and date
uploadHistorySchema.statics.findDuplicate = async function (fileHash, dataDate) {
  const startOfDay = new Date(dataDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(dataDate);
  endOfDay.setHours(23, 59, 59, 999);

  return await this.findOne({
    fileHash,
    dataDate: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
    status: { $in: ['success', 'partial_success'] },
  });
};

// Pre-save validation
uploadHistorySchema.pre('save', async function (next) {
  // Check for duplicates before saving
  if (!this.isDuplicate) {
    const duplicate = await this.constructor.findDuplicate(this.fileHash, this.dataDate);
    if (duplicate) {
      this.isDuplicate = true;
      this.duplicateOf = duplicate._id;
    }
  }
  next();
});

module.exports = mongoose.model('UploadHistory', uploadHistorySchema);
