const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user
  });
});

router.get(
  "/admin-test",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Admin access granted",
      user: req.user
    });
  }
);

router.get(
  "/campaign-manager-test",
  protect,
  authorizeRoles("campaign_manager"),
  (req, res) => {
    res.json({
      message: "Campaign Manager access granted",
      user: req.user
    });
  }
);

router.get(
  "/communication-test",
  protect,
  authorizeRoles("communication_team"),
  (req, res) => {
    res.json({
      message: "Communication Team access granted",
      user: req.user
    });
  }
);

module.exports = router;