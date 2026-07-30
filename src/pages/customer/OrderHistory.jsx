import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  processing: "#f59e0b",
  shipped: "#3b82f6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function OrderHistory() {
  const { currentUser } = useAuth();
  const { getOrdersByCustomer } = useStore();
  const orders = getOrdersByCustomer(currentUser?.id || "").sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1 className="page-title">My Orders</h1>
          <div className="empty-state">
            <span>📦</span>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <Link to="/" className="btn-primary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-NP", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </div>
                </div>
                <div className="order-card-right">
                  <span
                    className="order-status-badge"
                    style={{ background: STATUS_COLORS[order.status] + "22", color: STATUS_COLORS[order.status] }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="order-items-preview">
                {order.items.map((item) => (
                  <div key={item.productId} className="order-item-row">
                    <span className="order-item-name">{item.name}</span>
                    <span className="order-item-qty">x{item.quantity}</span>
                    <span className="order-item-price">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="order-card-footer">
                <div className="order-footer-info">
                  {order.promoCode && (
                    <span className="promo-used">🏷️ {order.promoCode} applied</span>
                  )}
                  <span className="order-payment">{order.paymentMethod}</span>
                </div>
                <div className="order-total">
                  <span>Total: </span>
                  <strong>Rs. {order.total?.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
