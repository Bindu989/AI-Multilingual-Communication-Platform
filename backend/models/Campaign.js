const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    objective: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    language: {
      type: String,
      required: true,
      trim: true
    },

    channel: {
      type: String,
      enum: ["sms", "email", "whatsapp", "push"],
      required: true
    },

    targetAudience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Audience",
      required: true
    },

    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "completed", "cancelled"],
      default: "draft"
    },

    scheduledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Campaign", campaignSchema);