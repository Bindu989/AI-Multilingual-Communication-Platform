const mongoose = require("mongoose");

const translationSchema = new mongoose.Schema(
  {
    sourceText: {
      type: String,
      required: true,
      trim: true
    },

    sourceLanguage: {
      type: String,
      required: true,
      trim: true
    },

    targetLanguage: {
      type: String,
      required: true,
      trim: true
    },

    translatedText: {
      type: String,
      required: true,
      trim: true
    },

    provider: {
      type: String,
      default: "manual"
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Translation", translationSchema);