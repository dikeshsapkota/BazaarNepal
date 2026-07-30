import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import CartItem from "../components/CartItem";

export default function Cart() {
  const { cartItems, cartTotal, discount, finalTotal, appliedPromo, applyPromo, removePromo, clearCart } = useCart();
  const { validatePromoCode } = useStore();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError("");
    setPromoSuccess("");
    setPromoLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = validatePromoCode(promoInput.trim(), cartTotal);
    if (result.valid) {
      applyPromo(result.promo);
      setPromoSuccess(`🎉 "${result.promo.code}" applied! You save Rs. ${
        result.promo.type === "percentage"
          ? Math.round((cartTotal * result.promo.discount) / 100).toLocaleString()
          : result.promo.discount.toLocaleString()
      }`);
      setPromoInput("");
    } else {
      setPromoError(result.error);
    }
    setPromoLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet</p>
            <Link to="/" className="btn-primary">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart <span className="item-count">({cartItems.length} items)</span></h1>
        <div className="cart-layout">
          <div className="cart-items-section">
            {cartItems.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
            <button className="clear-cart-btn" onClick={clearCart}>🗑 Clear Cart</button>
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {cartTotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount ({appliedPromo.code})</span>
                <span>- Rs. {discount.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">FREE</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total-row">
              <span>Total</span>
              <span>Rs. {finalTotal.toLocaleString()}</span>
            </div>

            {/* Promo Code */}
            <div className="promo-section">
              <h4 className="promo-title">🏷️ Promo Code</h4>
              {appliedPromo ? (
                <div className="applied-promo">
                  <span className="applied-code">✓ {appliedPromo.code}</span>
                  <button className="remove-promo-btn" onClick={() => { removePromo(); setPromoSuccess(""); }}>Remove</button>
                </div>
              ) : (
                <div className="promo-input-row">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                    className="promo-input"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                  />
                  <button
                    className={`apply-promo-btn ${promoLoading ? "loading" : ""}`}
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                  >
                    {promoLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {promoError && <div className="promo-error">{promoError}</div>}
              {promoSuccess && <div className="promo-success">{promoSuccess}</div>}
            </div>

            <button
              className="checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout →
            </button>

            <div className="secure-badge">
              🔒 Secure checkout with eSewa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
