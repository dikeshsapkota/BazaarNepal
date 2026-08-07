const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getSellerDashboardStats,
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

// Seller dashboard stats
router.get(
  "/seller/stats",
  protect,
  authorize("seller"),
  getSellerDashboardStats
);

// Seller gets orders containing their products
router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerOrders
);

module.exports = router;