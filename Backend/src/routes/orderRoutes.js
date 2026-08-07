const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getSellerOrders,
} = require("../controllers/orderController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Customer creates an order
router.post(
  "/",
  protect,
  authorize("customer"),
  createOrder
);

// Customer gets own orders
router.get(
  "/my",
  protect,
  authorize("customer"),
  getMyOrders
);

// Seller gets orders containing their products
router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerOrders
);

module.exports = router;