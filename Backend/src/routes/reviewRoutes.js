const express = require("express");
const router = express.Router();
const updateReview = require("../controllers/reviewController").updateReview;

const {
  addReview,
  checkReviewEligibility,
  getProductReviews,
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

// Customer: check whether a delivered order exists for this product
router.get(
  "/:productId/eligibility",
  protect,
  authorize("customer"),
  checkReviewEligibility
);

// Customer: add or update review
router.post(
  "/:productId",
  protect,
  authorize("customer"),
  addReview
);
//update a review 
router.put(
  "/:productId",
  protect,
  authorize("customer"),
  updateReview
);

module.exports = router;
