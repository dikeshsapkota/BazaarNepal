const Order = require("../models/Order");
const Product = require("../models/Product");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      discount,
      total,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        seller: product.seller,
        quantity: item.quantity,
        price: product.price,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      discount: discount || 0,
      total,
      paymentMethod: paymentMethod || "eSewa",
      paymentStatus: "pending",
      status: "processing",
    });

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