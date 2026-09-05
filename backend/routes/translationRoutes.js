const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createTranslation,
  aiTranslate,
  getTranslations,
  getTranslationById,
  deleteTranslation
} = require("../controllers/translationController");

// ==========================================
// CREATE MANUAL TRANSLATION
// ==========================================
router.post(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  createTranslation
);

// ==========================================
// AI TRANSLATION
// ==========================================
router.post(
  "/translate",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  aiTranslate
);

// ==========================================
// GET ALL TRANSLATIONS
// ==========================================
router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  getTranslations
);

// ==========================================
// GET TRANSLATION BY ID
// ==========================================
router.get(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  getTranslationById
);

// ==========================================
// DELETE TRANSLATION
// ==========================================
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteTranslation
);

module.exports = router;