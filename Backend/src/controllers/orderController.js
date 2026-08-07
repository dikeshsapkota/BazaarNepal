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
//seller dashboard
exports.getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // All orders containing this seller's products
    const orders = await Order.find({
      "items.seller": sellerId,
    })
      .populate("customer", "name email")
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    // Seller products
    const products = await Product.find({
      seller: sellerId,
    });

    let totalRevenue = 0;
    const productSales = {};
    const monthlySales = {};

    orders.forEach((order) => {
      // Ignore cancelled orders
      if (order.status === "cancelled") return;

      const sellerItems = order.items.filter(
        (item) => item.seller.toString() === sellerId
      );

      sellerItems.forEach((item) => {
        const revenue =
          Number(item.price) * Number(item.quantity);

        totalRevenue += revenue;

        // Top products
        const productId =
          item.product?._id?.toString() ||
          item.product?.toString();

        if (!productSales[productId]) {
          productSales[productId] = {
            name:
              item.product?.name ||
              "Product",
            revenue: 0,
            units: 0,
          };
        }

        productSales[productId].revenue += revenue;
        productSales[productId].units += item.quantity;

        // Monthly sales
        const month = new Date(
          order.createdAt
        ).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });

        monthlySales[month] =
          (monthlySales[month] || 0) +
          revenue;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const lowStockProducts = products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= 5
    );

    // Prepare recent orders containing only seller items
    const recentOrders = orders
      .map((order) => {
        const sellerItems = order.items.filter(
          (item) =>
            item.seller.toString() === sellerId
        );

        return {
          _id: order._id,
          customer: order.customer,
          items: sellerItems,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
        };
      })
      .filter((order) => order.items.length > 0)
      .slice(0, 5);

    const totalOrders = orders.filter(
      (order) => order.status !== "cancelled"
    ).length;

    const averageOrderValue =
      totalOrders > 0
        ? Math.round(
            totalRevenue / totalOrders
          )
        : 0;

    res.json({
      success: true,

      stats: {
        totalRevenue,
        totalOrders,
        productCount: products.length,
        averageOrderValue,
        topProducts,
        monthlySales,
        lowStockProducts,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const sellerId = req.user.id;

    const allowedStatuses = [
      "processing",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      "items.seller": sellerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or access denied",
      });
    }

    order.status = status;

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("items.product", "name image");

    res.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};