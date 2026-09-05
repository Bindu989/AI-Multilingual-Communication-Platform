const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  runCampaign
} = require("../controllers/campaignController");


// ==========================================
// CREATE CAMPAIGN
// ==========================================

router.post(
  "/",
  protect,
  authorizeRoles("admin", "campaign_manager"),
  createCampaign
);


// ==========================================
// GET ALL CAMPAIGNS
// ==========================================

router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  getCampaigns
);


// ==========================================
// RUN CAMPAIGN
// Admin + Campaign Manager
// ==========================================

router.post(
  "/:id/run",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager"
  ),
  runCampaign
);


// ==========================================
// GET SINGLE CAMPAIGN
// ==========================================

router.get(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  getCampaignById
);


// ==========================================
// UPDATE CAMPAIGN
// ==========================================

router.put(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager"
  ),
  updateCampaign
);


// ==========================================
// DELETE CAMPAIGN
// Admin only
// ==========================================

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteCampaign
);


module.exports = router;