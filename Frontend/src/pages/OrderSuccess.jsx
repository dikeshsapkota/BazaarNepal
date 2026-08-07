import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { verifyEsewaPayment } from "../api/orderApi";
import { useCart } from "../context/CartContext";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const data = searchParams.get("data");

        if (!data) {
          setError("Payment response not found.");
          return;
        }

        const response = await verifyEsewaPayment(data);

        setOrder(response.data.order);

        await clearCart();

        localStorage.removeItem("ecom_pending_order");
      } catch (err) {
        console.error("Payment verification failed:", err);

        setError(
          err.response?.data?.message ||
            "Payment verification failed."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Verifying payment...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />

          <h1 className="text-2xl font-bold text-gray-900">
            Payment Verification Failed
          </h1>

          <p className="mt-3 text-gray-500">
            {error}
          </p>

          <Link
            to="/cart"
            className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">

        <CheckCircle className="mx-auto mb-5 h-20 w-20 text-green-500" />

        <h1 className="text-3xl font-bold text-gray-900">
          Payment Successful
        </h1>

        <p className="mt-2 text-gray-500">
          Your order has been confirmed.
        </p>

        <div className="mt-6 space-y-2 rounded-xl bg-gray-50 p-5 text-left">
          <p>
            <strong>Order:</strong>{" "}
            #{order?._id?.slice(-8).toUpperCase()}
          </p>

          <p>
            <strong>Total:</strong>{" "}
            Rs. {Number(order?.total || 0).toLocaleString()}
          </p>

          <p>
            <strong>Payment:</strong>{" "}
            {order?.paymentStatus}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {order?.status}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/orders"
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white"
          >
            View Orders
          </Link>

          <Link
            to="/"
            className="rounded-xl border px-6 py-3 font-semibold text-gray-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}