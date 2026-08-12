const express = require("express");

const router = express.Router();

const {
  register,
  login,
 
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const {
  authLimiter,
} = require("../middleware/rateLimitMiddleware");

// Strict rate limiting only here
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);



module.exports = router;