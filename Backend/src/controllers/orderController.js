const Order = require("../models/Order");
const Product = require("../models/Product");
const PromoCode = require("../models/PromoCode");
// Create Order
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      promoCode,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`,
        });
      }

      subtotal += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        seller: product.seller,
        quantity: item.quantity,
        price: product.price,
      });
    }

    let discount = 0;
    let validatedPromoCode = null;

    if (promoCode) {
      const promo = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        active: true,
      });

      if (!promo) {
        return res.status(400).json({
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

      if (subtotal < promo.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of Rs. ${promo.minOrderAmount} required`,
        });
      }

      if (promo.type === "percentage") {
        discount = Math.round(
          (subtotal * promo.discount) / 100
        );
      } else {
        discount = promo.discount;
      }

      discount = Math.min(discount, subtotal);

      validatedPromoCode = promo.code;
    }

    const total = Math.max(0, subtotal - discount);

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      discount,
      promoCode: validatedPromoCode,
      total,
      paymentMethod: paymentMethod || "eSewa",
      paymentStatus: "pending",
      status: "processing",
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    if (validatedPromoCode) {
      await PromoCode.findOneAndUpdate(
        { code: validatedPromoCode },
        {
          $inc: {
            usedCount: 1,
          },
        }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("items.product", "name image price")
      .populate("items.seller", "name shopName");

    res.status(201).json({
      success: true,
      order: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get logged-in customer's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user.id,
    })
      .populate("items.product", "name image")
      .populate("items.seller", "name shopName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get logged-in seller's orders
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.seller": req.user.id,
    })
      .populate("customer", "name email")
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    const sellerOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.filter(
        (item) => item.seller.toString() === req.user.id
      ),
    }));

    res.json({
      success: true,
      orders: sellerOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};