const PromoCode = require("../models/PromoCode");

// Create promo code
exports.createPromoCode = async (req, res) => {
  try {
    const {
      code,
      type,
      discount,
      minOrderAmount,
      maxUses,
      expiryDate,
      active,
      description,
    } = req.body;

    const existingPromo = await PromoCode.findOne({
      code: code.toUpperCase(),
    });

    if (existingPromo) {
      return res.status(400).json({
        success: false,
        message: "Promo code already exists",
      });
    }

    const promo = await PromoCode.create({
      seller: req.user.id,
      code: code.toUpperCase(),
      type,
      discount,
      minOrderAmount,
      maxUses,
      expiryDate,
      active,
      description,
    });

    res.status(201).json({
      success: true,
      promo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get seller's promo codes
exports.getSellerPromos = async (req, res) => {
  try {
    const promos = await PromoCode.find({
      seller: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      promos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update promo code
exports.updatePromoCode = async (req, res) => {
  try {
    const promo = await PromoCode.findOneAndUpdate(
      {
        _id: req.params.id,
        seller: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    res.json({
      success: true,
      promo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete promo code
exports.deletePromoCode = async (req, res) => {
  try {
    const promo = await PromoCode.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.id,
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    res.json({
      success: true,
      message: "Promo code deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Validate promo code for customer
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Invalid promo code",
      });
    }

    if (new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Promo code has expired",
      });
    }

    if (promo.usedCount >= promo.maxUses) {
      return res.status(400).json({
        success: false,
        message: "Promo code usage limit reached",
      });
    }

    if (cartTotal < promo.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of Rs. ${promo.minOrderAmount} required`,
      });
    }

    let discount = 0;

    if (promo.type === "percentage") {
      discount = Math.round(
        (cartTotal * promo.discount) / 100
      );
    } else {
      discount = promo.discount;
    }

    discount = Math.min(discount, cartTotal);

    res.json({
      success: true,
      promo,
      discount,
      finalTotal: Math.max(0, cartTotal - discount),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};