const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage
} = require("../controllers/messageController");


// ==========================================
// CREATE MESSAGE
// ==========================================
router.post(
  "/",
  protect,
  authorizeRoles("admin", "campaign_manager", "communication_team"),
  createMessage
);


// ==========================================
// GET ALL MESSAGES
// ==========================================
router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  getMessages
);


// ==========================================
// GET SINGLE MESSAGE
// ==========================================
router.get(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  getMessageById
);


// ==========================================
// UPDATE MESSAGE STATUS
// ==========================================
router.put(
  "/:id/status",
  protect,
  authorizeRoles(
    "admin",
    "campaign_manager",
    "communication_team"
  ),
  updateMessageStatus
);


// ==========================================
// DELETE MESSAGE
// ==========================================
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteMessage
);


module.exports = router;