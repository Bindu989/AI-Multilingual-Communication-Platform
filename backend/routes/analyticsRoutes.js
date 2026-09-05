const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const { getAnalytics } = require("../controllers/analyticsController");

router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  getAnalytics
);

module.exports = router;