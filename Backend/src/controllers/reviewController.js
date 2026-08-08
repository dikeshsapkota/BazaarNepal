const Order = require("../models/Order");
const Product = require("../models/Product");

// Add or update a review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!rating || !comment?.trim()) {
  return res.status(400).json({
    success: false,
    message: "Rating and comment are required",
  });
}

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }
const customerId = req.user.id || req.user._id;

const purchasedOrder = await Order.findOne({
  customer: customerId,
  "items.product": req.params.productId,
  status: "delivered",
});

if (!purchasedOrder) {
  return res.status(403).json({
    success: false,
    message: "You can only review products you have purchased.",
  });
}

const existingReview = product.reviewsList.find(
  (review) => review.user.toString() === req.user.id
);

if (existingReview) {
  existingReview.rating = numericRating;
  existingReview.comment = comment.trim();
  existingReview.name =
    req.user.name || existingReview.name;
  existingReview.verifiedPurchase = true;
} else {
  product.reviewsList.push({
  user: req.user.id,
  name: req.user.name || "Customer",
  rating: numericRating,
  comment: comment.trim(),
  verifiedPurchase: true,
});
}

    product.reviews = product.reviewsList.length;

    product.rating =
      product.reviewsList.reduce(
        (sum, review) => sum + review.rating,
        0
      ) / product.reviews;

    await product.save();

    res.json({
      success: true,
      message: existingReview
        ? "Review updated successfully"
        : "Review added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      
    });
  }
};

// Get reviews for one product
exports.getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.productId
    ).select("reviewsList rating reviews");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      rating: product.rating,
      reviews: product.reviews,
      reviewsList: product.reviewsList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.checkReviewEligibility = async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;

    const purchasedOrder = await Order.findOne({
      customer: customerId,
      "items.product": req.params.productId,
      status: "delivered",
    });

    res.json({
      success: true,
      canReview: Boolean(purchasedOrder),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
