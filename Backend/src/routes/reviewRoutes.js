const express = require("express");
const router = express.Router();

const {
  addReview,
  getProductReviews,
  checkReviewEligibility,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// Public: get reviews for a product
router.get(
  "/:productId",
  getProductReviews
);

// Customer: check whether a delivered order exists
router.get(
  "/:productId/eligibility",
  protect,
  authorize("customer"),
  checkReviewEligibility
);

// Customer: add review
router.post(
  "/:productId",
  protect,
  authorize("customer"),
  addReview
);

// Customer: update review
router.put(
  "/:productId",
  protect,
  authorize("customer"),
  updateReview
);

// Customer: delete review
router.delete(
  "/:productId",
  protect,
  authorize("customer"),
  deleteReview
);

module.exports = router;