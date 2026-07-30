import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { initiateEsewaPayment, generateTransactionId } from "../utils/esewa";

export default function Checkout() {
  const { cartItems, cartTotal, discount, finalTotal, appliedPromo, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { placeOrder } = useStore();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState({
    fullName: currentUser?.name || "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleEsewaPayment = async (e) => {
    e.preventDefault();
    setPaying(true);

    // Place the order first (save to localStorage)
    const transactionId = generateTransactionId();
    const order = placeOrder({
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      shippingAddress: { ...form },
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sellerId: item.sellerId,
      })),
      subtotal: cartTotal,
      discount,
      total: finalTotal,
      promoCode: appliedPromo?.code || null,
      paymentMethod: "eSewa",
      transactionId,
    });

    // Save pending order info for success page
    localStorage.setItem("ecom_pending_order", JSON.stringify(order));
    clearCart();

    // Initiate eSewa payment
    try {
      await initiateEsewaPayment({
        amount: finalTotal,
        taxAmount: 0,
        serviceCharge: 0,
        deliveryCharge: 0,
        orderId: transactionId,
      });
    } catch (err) {
      console.error("eSewa payment error:", err);
      // Fallback: go to success page directly for demo
      navigate("/order-success");
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>
        <div className="checkout-layout">
          {/* Shipping Form */}
          <div className="checkout-form-section">
            <div className="checkout-card">
              <h3 className="checkout-card-title">📦 Shipping Information</h3>
              <form onSubmit={handleEsewaPayment} id="checkout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                      className="form-input"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      className="form-input"
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Delivery Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                    className="form-input"
                    placeholder="Street address, ward number..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City / District</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                      className="form-input"
                      placeholder="Kathmandu"
                    />
                  </div>
                  <div className="form-group">
                    <label>Order Notes (optional)</label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="form-input"
                      placeholder="Special instructions..."
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="checkout-card">
              <h3 className="checkout-card-title">💳 Payment Method</h3>
              <div className="payment-option selected">
                <div className="payment-option-left">
                  <div className="esewa-logo">eSewa</div>
                  <div>
                    <div className="payment-name">eSewa Digital Wallet</div>
                    <div className="payment-desc">Secure payment via eSewa (RC Test Mode)</div>
                  </div>
                </div>
                <div className="payment-check">✓</div>
              </div>
              <div className="esewa-test-note">
                🧪 <strong>Test Mode:</strong> Use eSewa test credentials. No real money will be charged.
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="checkout-card">
              <h3 className="checkout-card-title">🛒 Order Summary</h3>
              <div className="checkout-items-list">
                {cartItems.map((item) => (
                  <div key={item.productId} className="checkout-item">
                    <img src={item.image} alt={item.name} className="checkout-item-img" />
                    <div className="checkout-item-info">
                      <div className="checkout-item-name">{item.name}</div>
                      <div className="checkout-item-qty">Qty: {item.quantity}</div>
                    </div>
                    <div className="checkout-item-price">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-divider" />
              <div className="summary-row"><span>Subtotal</span><span>Rs. {cartTotal.toLocaleString()}</span></div>
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Promo ({appliedPromo?.code})</span>
                  <span>- Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row"><span>Shipping</span><span className="free-shipping">FREE</span></div>
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span>Total</span>
                <span>Rs. {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className={`esewa-pay-btn ${paying ? "loading" : ""}`}
              disabled={paying}
            >
              {paying ? (
                <span className="btn-spinner-white" />
              ) : (
                <>
                  <span className="esewa-pay-logo">eSewa</span>
                  Pay Rs. {finalTotal.toLocaleString()}
                </>
              )}
            </button>

            <div className="secure-badge">
              🔒 256-bit SSL encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
