const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  resetUserPassword
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Reset User Password - Admin Only
router.put(
  "/reset-password",
  protect,
  authorizeRoles("admin"),
  resetUserPassword
);

module.exports = router;