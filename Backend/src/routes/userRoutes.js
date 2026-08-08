const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/userController");

const {
  protect,
} = require("../middleware/authMiddleware");

// Get logged-in user's profile
router.get(
  "/me",
  protect,
  getMyProfile
);

// Update logged-in user's profile
router.put(
  "/me",
  protect,
  updateMyProfile
);
//change password in user's profile
router.put(
  "/change-password",
  protect,
  changePassword
);
module.exports = router;