import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("ecom_cart");
    if (saved) setCartItems(JSON.parse(saved));
    const promo = localStorage.getItem("ecom_applied_promo");
    if (promo) setAppliedPromo(JSON.parse(promo));
  }, []);

  const saveCart = (items) => {
    localStorage.setItem("ecom_cart", JSON.stringify(items));
    setCartItems(items);
  };

  const addToCart = (product, quantity = 1) => {
    const existing = cartItems.find((item) => item.productId === product.id);
    let updated;
    if (existing) {
      updated = cartItems.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
          : item
      );
    } else {
      updated = [
        ...cartItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          sellerId: product.sellerId,
          stock: product.stock,
          quantity,
        },
      ];
    }
    saveCart(updated);
  };

  const removeFromCart = (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    const updated = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedPromo(null);
    localStorage.removeItem("ecom_cart");
    localStorage.removeItem("ecom_applied_promo");
  };

  const applyPromo = (promoData) => {
    setAppliedPromo(promoData);
    localStorage.setItem("ecom_applied_promo", JSON.stringify(promoData));
  };

  const removePromo = () => {
    setAppliedPromo(null);
    localStorage.removeItem("ecom_applied_promo");
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      discount = Math.round((cartTotal * appliedPromo.discount) / 100);
    } else {
      discount = appliedPromo.discount;
    }
  }

  const finalTotal = Math.max(0, cartTotal - discount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromo,
        removePromo,
        appliedPromo,
        cartTotal,
        cartCount,
        discount,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
