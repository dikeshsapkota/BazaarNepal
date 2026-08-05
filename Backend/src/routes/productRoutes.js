const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getSellerProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Public
router.get("/", getProducts);

// Seller only
router.get("/seller", protect, authorize("seller"), getSellerProducts);

router.post("/", protect, authorize("seller"), createProduct);

router.put("/:id", protect, authorize("seller"), updateProduct);

router.delete("/:id", protect, authorize("seller"), deleteProduct);

module.exports = router;