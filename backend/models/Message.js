const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true
    },

    audience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Audience",
      required: true
    },

    recipientName: {
      type: String,
      required: true
    },

    recipientContact: {
      type: String,
      required: true
    },

    channel: {
      type: String,
      enum: ["sms", "email", "whatsapp", "push"],
      required: true
    },

    language: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "pending"
    },

    sentAt: {
      type: Date,
      default: null
    },

    deliveredAt: {
      type: Date,
      default: null
    },

    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Message", messageSchema);