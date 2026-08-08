import { createContext, useContext, useState, useEffect } from "react";

import {
  getProducts,
  createProduct,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
} from "../api/productApi";
const StoreContext = createContext(null);

function initData(key, seed) {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await getProducts();  
        setProducts(data.products);
      } catch (err) {
        console.error(err);
      }
    };

    loadProducts();

    setPromoCodes(initData("ecom_promos", []));
    setOrders(initData("ecom_orders", []));
  }, []);

  // --- Products ---
const addProduct = async (product) => {
  try {
   const { data } = await createProduct(product);

    setProducts((prev) => [...prev, data.product]);

    return data.product;

  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateProduct = async (productId, updates) => {
  try {
  const { data } = await updateProductApi(
  productId,
  updates
);

    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId
          ? data.product
          : p
      )
    );

  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteProduct = async (productId) => {
  try {
   await deleteProductApi(productId);

    setProducts((prev) =>
      prev.filter((p) => p._id !== productId)
    );

  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getProductsBySeller = (sellerId) =>
  products.filter((p) => {
    if (typeof p.seller === "object") {
      return p.seller._id === sellerId;
    }

    return p.seller === sellerId;
  });

  // --- Promo Codes ---
  const addPromoCode = (promo) => {
    const newPromo = { ...promo, id: "promo_" + Date.now(), usedCount: 0 };
    const updated = [...promoCodes, newPromo];
    setPromoCodes(updated);
    localStorage.setItem("ecom_promos", JSON.stringify(updated));
    return newPromo;
  };

  const updatePromoCode = (promoId, updates) => {
    const updated = promoCodes.map((p) => (p.id === promoId ? { ...p, ...updates } : p));
    setPromoCodes(updated);
    localStorage.setItem("ecom_promos", JSON.stringify(updated));
  };

  const deletePromoCode = (promoId) => {
    const updated = promoCodes.filter((p) => p.id !== promoId);
    setPromoCodes(updated);
    localStorage.setItem("ecom_promos", JSON.stringify(updated));
  };

  const validatePromoCode = (code, cartTotal) => {
    const promo = promoCodes.find(
      (p) => p.code.toUpperCase() === code.toUpperCase() && p.active
    );
    if (!promo) return { valid: false, error: "Invalid promo code." };
    if (new Date(promo.expiryDate) < new Date()) return { valid: false, error: "Promo code has expired." };
    if (promo.usedCount >= promo.maxUses) return { valid: false, error: "Promo code usage limit reached." };
    if (cartTotal < promo.minOrderAmount)
      return { valid: false, error: `Minimum order amount of Rs. ${promo.minOrderAmount} required.` };
    return { valid: true, promo };
  };

  const usePromoCode = (promoId) => {
    updatePromoCode(promoId, {
      usedCount: (promoCodes.find((p) => p.id === promoId)?.usedCount || 0) + 1,
    });
  };

  const getPromosBySeller = (sellerId) => promoCodes.filter((p) => p.sellerId === sellerId);

  // --- Orders ---
  const placeOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: "ord_" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "processing",
    };
    const updated = [...orders, newOrder];
    setOrders(updated);
    localStorage.setItem("ecom_orders", JSON.stringify(updated));

    // Reduce stock
    orderData.items.forEach((item) => {
      const product = products.find((p) => p._id === item.productId);
      if (product) {
        updateProduct(item.productId, { stock: Math.max(0, product.stock - item.quantity) });
      }
    });

    if (orderData.promoCode) {
      const promo = promoCodes.find((p) => p.code === orderData.promoCode);
      if (promo) usePromoCode(promo.id);
    }

    return newOrder;
  };

  const getOrdersByCustomer = (customerId) => orders.filter((o) => o.customerId === customerId);

  const getOrdersBySeller = (sellerId) =>
    orders
      .filter((o) => o.items.some((item) => item.sellerId === sellerId))
      .map((o) => ({
        ...o,
        items: o.items.filter((item) => item.sellerId === sellerId),
      }));

  const getSellerStats = (sellerId) => {
    const sellerOrders = getOrdersBySeller(sellerId);
    const totalRevenue = sellerOrders.reduce(
      (sum, order) =>
        sum + order.items.reduce((s, item) => s + item.price * item.quantity, 0),
      0
    );
    const totalOrders = sellerOrders.length;
    const productCount = getProductsBySeller(sellerId).length;

    const productSales = {};
    sellerOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, revenue: 0, units: 0 };
        }
        productSales[item.productId].revenue += item.price * item.quantity;
        productSales[item.productId].units += item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const monthlySales = {};
    sellerOrders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!monthlySales[month]) monthlySales[month] = 0;
      monthlySales[month] += order.items.reduce((s, item) => s + item.price * item.quantity, 0);
    });

    return { totalRevenue, totalOrders, productCount, topProducts, monthlySales };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductsBySeller,
        promoCodes,
        addPromoCode,
        updatePromoCode,
        deletePromoCode,
        validatePromoCode,
        getPromosBySeller,
        orders,
        placeOrder,
        getOrdersByCustomer,
        getOrdersBySeller,
        getSellerStats,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
