const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getSellerDashboardStats,
  updateOrderStatus,
   verifyEsewaPayment,
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
// Seller updates order status for their items
router.put(
  "/:id/status",
  protect,
  authorize("seller"),
  updateOrderStatus
);
// Seller gets orders containing their products
router.get(
  "/seller",
  protect,
  authorize("seller"),
  getSellerOrders
);
// Verify eSewa payment
router.get(
  "/esewa/verify",
  protect,
  authorize("customer"),
  verifyEsewaPayment
);

module.exports = router;