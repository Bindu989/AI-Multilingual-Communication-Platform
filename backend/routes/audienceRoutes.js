const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createAudience,
  getAudiences,
  getAudienceById,
  updateAudience,
  deleteAudience,
  addRecipient,
  updateRecipient,
  deleteRecipient,
} = require("../controllers/audienceController");

// ==========================================
// AUDIENCE ROUTES
// ==========================================

// Create audience
// Admin + Campaign Manager
router.post(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager"
  ),
  createAudience
);

// Get all audiences
// Admin + Campaign Manager + Communication Team
router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  getAudiences
);

// ==========================================
// RECIPIENT ROUTES
// ==========================================

// Add recipient to an audience
// Admin + Campaign Manager
router.post(
  "/:id/recipients",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager"
  ),
  addRecipient
);

// Update recipient
// Admin + Campaign Manager
router.put(
  "/:id/recipients/:recipientId",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager"
  ),
  updateRecipient
);

// Delete recipient
// Admin + Campaign Manager
router.delete(
  "/:id/recipients/:recipientId",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager"
  ),
  deleteRecipient
);

// ==========================================
// SINGLE AUDIENCE
// ==========================================

// Get single audience
// All authenticated roles
router.get(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  getAudienceById
);

// Update audience
// Admin + Campaign Manager
router.put(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager"
  ),
  updateAudience
);

// Delete audience
// Admin only
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteAudience
);

module.exports = router;