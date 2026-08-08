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

    // Check if customer purchased and received this product
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

    // Check if customer already reviewed this product
    const existingReview = product.reviewsList.find(
      (review) =>
        review.user.toString() === customerId.toString()
    );

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    // Add new review
    product.reviewsList.push({
      user: customerId,
      name: req.user.name || "Customer",
      rating: numericRating,
      comment: comment.trim(),
      verifiedPurchase: true,
    });

    // Recalculate review count
    product.reviews = product.reviewsList.length;

    // Recalculate average rating
    product.rating =
      product.reviewsList.reduce(
        (sum, review) => sum + review.rating,
        0
      ) / product.reviews;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
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
    const product = await Product.findById(
      req.params.productId
    ).select("reviewsList");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = product.reviewsList.find(
      (review) =>
        review.user.toString() === customerId.toString()
    );

    if (existingReview) {
      return res.json({
        success: true,
        canReview: false,
        reason: "already_reviewed",
        review: existingReview,
      });
    }

    const purchasedOrder = await Order.findOne({
      customer: customerId,
      "items.product": req.params.productId,
      status: "delivered",
    });

    res.json({
      success: true,
      canReview: Boolean(purchasedOrder),
      reason: purchasedOrder ? null : "not_delivered",
      review: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    const customerId = req.user.id || req.user._id;

    if (!comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
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

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = product.reviewsList.find(
      (review) =>
        review.user.toString() === customerId.toString()
    );

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    existingReview.rating = numericRating;
    existingReview.comment = comment.trim();
    existingReview.name =
      req.user.name || existingReview.name;

    product.rating =
      product.reviewsList.reduce(
        (sum, review) => sum + review.rating,
        0
      ) / product.reviewsList.length;

    await product.save();

    res.json({
      success: true,
      message: "Review updated successfully",
      review: existingReview,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//delete a review
exports.deleteReview = async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviewIndex = product.reviewsList.findIndex(
      (review) =>
        review.user.toString() === customerId.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    product.reviewsList.splice(reviewIndex, 1);

    product.reviews = product.reviewsList.length;

    if (product.reviews > 0) {
      product.rating =
        product.reviewsList.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / product.reviews;
    } else {
      product.rating = 0;
    }

    await product.save();

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
