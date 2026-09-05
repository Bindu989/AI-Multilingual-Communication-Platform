const Translation = require("../models/Translation");
const {
  translateText,
} = require("../services/translationService");

// ==========================================
// CREATE MANUAL TRANSLATION
// ==========================================
const createTranslation = async (req, res) => {
  try {
    const {
      sourceText,
      sourceLanguage,
      targetLanguage,
      translatedText,
      provider,
    } = req.body;

    if (
      !sourceText ||
      !sourceLanguage ||
      !targetLanguage ||
      !translatedText
    ) {
      return res.status(400).json({
        message:
          "All required translation fields must be provided",
      });
    }

    const translation =
      await Translation.create({
        sourceText:
          sourceText.trim(),
        sourceLanguage:
          sourceLanguage.trim(),
        targetLanguage:
          targetLanguage.trim(),
        translatedText:
          translatedText.trim(),
        provider:
          provider || "manual",
        status: "completed",
      });

    return res.status(201).json({
      message:
        "Translation created successfully",
      data: translation,
    });
  } catch (error) {
    console.error(
      "Create translation error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create translation",
      error: error.message,
    });
  }
};

// ==========================================
// AI TRANSLATION
// ==========================================
const aiTranslate = async (req, res) => {
  try {
    const {
      sourceText,
      sourceLanguage,
      targetLanguage,
    } = req.body;

    if (
      !sourceText?.trim() ||
      !sourceLanguage ||
      !targetLanguage
    ) {
      return res.status(400).json({
        message:
          "Source text, source language and target language are required",
      });
    }

    if (
      sourceLanguage ===
      targetLanguage
    ) {
      return res.status(400).json({
        message:
          "Source and target languages must be different",
      });
    }

    const translatedText =
      await translateText(
        sourceText,
        sourceLanguage,
        targetLanguage
      );

    if (!translatedText) {
      return res.status(500).json({
        message:
          "Translation provider returned no translation",
      });
    }

    // Determine provider based on target language.
    // DeepL is the primary provider.
    const deepLSupportedLanguages = [
      "English",
      "Telugu",
      "Hindi",
      "Tamil",
      "Malayalam",
      "Bengali",
      "Marathi",
      "Gujarati",
      "Punjabi",
      "Spanish",
      "French",
      "German",
      "Italian",
      "Portuguese",
      "Dutch",
      "Russian",
      "Japanese",
      "Korean",
      "Chinese",
    ];

    const provider =
      deepLSupportedLanguages.includes(
        targetLanguage
      )
        ? "deepl"
        : "fallback";

    const translation =
      await Translation.create({
        sourceText:
          sourceText.trim(),
        sourceLanguage:
          sourceLanguage.trim(),
        targetLanguage:
          targetLanguage.trim(),
        translatedText:
          translatedText.trim(),
        provider,
        status: "completed",
      });

    return res.status(201).json({
      message:
        "AI translation completed successfully",
      data: translation,
    });
  } catch (error) {
    console.error(
      "AI Translation Error:",
      error.message
    );

    return res.status(500).json({
      message:
        "AI translation failed",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL TRANSLATIONS
// ==========================================
const getTranslations = async (req, res) => {
  try {
    const translations =
      await Translation.find()
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      message:
        "Translations fetched successfully",
      count: translations.length,
      translations,
    });
  } catch (error) {
    console.error(
      "Get translations error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch translations",
      error: error.message,
    });
  }
};

// ==========================================
// GET TRANSLATION BY ID
// ==========================================
const getTranslationById = async (
  req,
  res
) => {
  try {
    const translation =
      await Translation.findById(
        req.params.id
      );

    if (!translation) {
      return res.status(404).json({
        message:
          "Translation not found",
      });
    }

    return res.status(200).json({
      message:
        "Translation fetched successfully",
      data: translation,
    });
  } catch (error) {
    console.error(
      "Get translation error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch translation",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE TRANSLATION
// ==========================================
const deleteTranslation = async (
  req,
  res
) => {
  try {
    const translation =
      await Translation.findByIdAndDelete(
        req.params.id
      );

    if (!translation) {
      return res.status(404).json({
        message:
          "Translation not found",
      });
    }

    return res.status(200).json({
      message:
        "Translation deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete translation error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete translation",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  createTranslation,
  aiTranslate,
  getTranslations,
  getTranslationById,
  deleteTranslation,
};