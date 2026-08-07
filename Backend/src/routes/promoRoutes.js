const express = require("express");
const router = express.Router();

const {
  createPromoCode,
  getSellerPromos,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
} = require("../controllers/promoController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Seller routes
router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerPromos
);

router.post(
  "/",
  protect,
  authorize("seller"),
  createPromoCode
);

router.put(
  "/:id",
  protect,
  authorize("seller"),
  updatePromoCode
);

router.delete(
  "/:id",
  protect,
  authorize("seller"),
  deletePromoCode
);

// Customer validation
router.post(
  "/validate",
  protect,
  authorize("customer"),
  validatePromoCode
);

module.exports = router;