import { createContext, useContext, useState, useEffect } from "react";
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
} from "../api/cartApi";
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

 useEffect(() => {
  loadCart();

  const promo = localStorage.getItem("ecom_applied_promo");

  if (promo) {
    setAppliedPromo(JSON.parse(promo));
  }
}, []);

const loadCart = async () => {
  try {
    const { data } = await getCart();

    const items = data.cart.items
      .filter((item) => item.product)
      .map((item) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        stock: item.product.stock,
        sellerId:
          typeof item.product.seller === "object"
            ? item.product.seller._id
            : item.product.seller,
        quantity: item.quantity,
      }));

    setCartItems(items);
  } catch (err) {
    console.error("Load cart failed:", err);
  }
};

const addToCart = async (product, quantity = 1) => {
  try {
    await addToCartApi(product._id, quantity);

    loadCart();

  } catch (err) {
    console.error(err);
  }
};

  

  const removeFromCart = async (productId) => {
  await removeCartItem(productId);

  loadCart();
};

  const updateQuantity = async (productId, quantity) => {
  await updateCartItem(productId, quantity);

  loadCart();
};

const clearCart = async () => {
  try {
    await clearCartApi();

    setCartItems([]);

    removePromo();

  } catch (err) {
    console.error(err);
  }
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
