const mongoose = require("mongoose");

// ==========================================
// RECIPIENT SCHEMA
// ==========================================
const recipientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },
  },
  {
    // Keep MongoDB _id for every recipient
    _id: true,
  }
);

// ==========================================
// AUDIENCE SCHEMA
// ==========================================
const audienceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    language: {
      type: String,
      required: true,
      trim: true,
    },

    occupation: {
      type: String,
      required: true,
      trim: true,
    },

    engagementHistory: {
      type: String,
      default: "No previous engagement",
      trim: true,
    },

    // ==========================================
    // ACTUAL PEOPLE INSIDE THIS AUDIENCE
    // ==========================================
    recipients: {
      type: [recipientSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Audience",
  audienceSchema
);