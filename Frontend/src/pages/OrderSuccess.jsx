import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export default function OrderSuccess() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Read the data returned by eSewa
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get("data");

    let payment = null;

    if (encodedData) {
      payment = JSON.parse(atob(encodedData));
      console.log(payment); // Check the payment data in the console
    }

    const pending = localStorage.getItem("ecom_pending_order");

    if (pending) {
      const order = JSON.parse(pending);

      if (payment) {
        order.status = payment.status;
        order.transactionCode = payment.transaction_code;
        order.transactionUuid = payment.transaction_uuid;
        order.total = payment.total_amount;
      }

      setOrder(order);
      localStorage.removeItem("cart");
      localStorage.setItem("ecom_pending_order", JSON.stringify(order));
    }
  }, []);
  if (!order) {
    return (
      <div className="text-center py-20">
        <h2>No order found.</h2>
        <p>Please complete a payment first.</p>
      </div>
    );
  }
  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-animation">
          <div className="success-circle">
            <Check className="success-check" aria-hidden="true" />
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
              <span className="order-detail-value">
                {order.transactionUuid || order.transactionId}
              </span>
            </div>
            <div className="order-detail-row">
              <span>Transaction ID</span>
              <span className="order-detail-value mono">
                {order.transactionId}
              </span>
            </div>
            <div className="order-detail-row">
              <span>Amount Paid</span>
              <span className="order-detail-value">Rs. {order.total?.toLocaleString()}</span>
            </div>
            <div className="order-detail-row">
              <span>Payment Date</span>

              <span className="order-detail-value">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="order-detail-row">
              <span>Payment Method</span>
              <span className="order-detail-value esewa-text">eSewa</span>
            </div>
            <div className="order-detail-row">
              <span>Status</span>
              <span
                className={`status-badge ${order?.status === "COMPLETE"
                  ? "completed"
                  : order?.status === "FAILED"
                    ? "failed"
                    : "processing"
                  }`}
              >
                {order?.status || "Processing"}
              </span>
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
