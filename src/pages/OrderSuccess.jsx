import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function OrderSuccess() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const pending = localStorage.getItem("ecom_pending_order");
    if (pending) {
      setOrder(JSON.parse(pending));
      localStorage.removeItem("ecom_pending_order");
    }
  }, []);

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-animation">
          <div className="success-circle">
            <span className="success-check">✓</span>
          </div>
        </div>
        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-subtitle">
          Thank you for your purchase. Your payment via eSewa was processed successfully.
        </p>
        {order && (
          <div className="order-details-box">
            <div className="order-detail-row">
              <span>Order ID</span>
              <span className="order-detail-value">{order.id}</span>
            </div>
            <div className="order-detail-row">
              <span>Transaction ID</span>
              <span className="order-detail-value mono">{order.transactionId}</span>
            </div>
            <div className="order-detail-row">
              <span>Amount Paid</span>
              <span className="order-detail-value">Rs. {order.total?.toLocaleString()}</span>
            </div>
            <div className="order-detail-row">
              <span>Payment Method</span>
              <span className="order-detail-value esewa-text">eSewa</span>
            </div>
            <div className="order-detail-row">
              <span>Status</span>
              <span className="status-badge processing">Processing</span>
            </div>
          </div>
        )}
        <div className="success-actions">
          <Link to="/orders" className="btn-primary">View My Orders</Link>
          <Link to="/" className="btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
