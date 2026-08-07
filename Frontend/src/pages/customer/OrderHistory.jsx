import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Package, Tag } from "lucide-react";
import { getMyOrders } from "../../api/orderApi";

const STATUS_COLORS = {
  processing: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await getMyOrders();

        const sortedOrders = [...data.orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
      } catch (err) {
        console.error("Failed to load orders:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />

          <p className="mt-4 text-gray-500">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md border border-red-100 p-8 text-center max-w-md w-full">
          <div className="text-5xl mb-4">⚠️</div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to load orders
          </h2>

          <p className="text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-10 text-center max-w-md w-full">
          <Package className="mx-auto h-16 w-16 text-violet-500 mb-5" />

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No orders yet
          </h2>

          <p className="text-gray-500 mb-6">
            Start shopping to see your orders here.
          </p>

          <Link
            to="/"
            className="inline-block bg-violet-600 text-white px-6 py-3 rounded-xl hover:bg-violet-700 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="text-gray-500 mt-1">
            Track and review your recent purchases.
          </p>
        </div>

        <div className="space-y-6">
          {orders.map((order) => {
            const statusColor =
              STATUS_COLORS[order.status] || "#6b7280";

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4 border-b pb-4">

                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-NP",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">

                    <span
                      className="px-4 py-2 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor:
                          statusColor + "22",
                        color: statusColor,
                      }}
                    >
                      {order.status
                        ? order.status
                            .charAt(0)
                            .toUpperCase() +
                          order.status.slice(1)
                        : "Processing"}
                    </span>

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus === "paid"
                        ? "Paid"
                        : "Payment Pending"}
                    </span>
                  </div>
                </div>

                {/* Products */}
                <div className="divide-y mt-4">
                  {order.items.map((item, index) => (
                    <div
                      key={
                        item.product?._id ||
                        `${order._id}-${index}`
                      }
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
                    >
                      <div className="flex items-center gap-4">

                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={
                              item.product?.name ||
                              "Product"
                            }
                            className="h-20 w-20 rounded-xl object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.product?.name ||
                              "Product unavailable"}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Qty: {item.quantity}
                          </p>

                          <p className="text-sm text-gray-500">
                            Rs.{" "}
                            {Number(
                              item.price || 0
                            ).toLocaleString()}{" "}
                            each
                          </p>
                        </div>
                      </div>

                      <p className="font-semibold text-violet-600">
                        Rs.{" "}
                        {(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="mt-5 border-t pt-5 space-y-2">

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>

                    <span>
                      Rs.{" "}
                      {Number(
                        order.subtotal || 0
                      ).toLocaleString()}
                    </span>
                  </div>

                  {Number(order.discount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />

                        {order.promoCode
                          ? `Promo (${order.promoCode})`
                          : "Discount"}
                      </span>

                      <span>
                        - Rs.{" "}
                        {Number(
                          order.discount
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span>Total</span>

                    <span className="text-violet-600">
                      Rs.{" "}
                      {Number(
                        order.total || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mt-6 border-t pt-4">

                  <div className="space-y-2">

                    <p className="flex items-center gap-2 text-gray-600 text-sm">
                      <CreditCard className="h-4 w-4" />
                      Payment Method:{" "}
                      {order.paymentMethod || "eSewa"}
                    </p>

                    {order.promoCode && (
                      <p className="flex items-center gap-2 text-green-600 text-sm">
                        <Tag className="h-4 w-4" />
                        Promo used: {order.promoCode}
                      </p>
                    )}
                  </div>

                  {order.shippingAddress && (
                    <div className="text-sm text-gray-500 md:text-right">
                      <p className="font-medium text-gray-700">
                        Delivery Address
                      </p>

                      <p>
                        {order.shippingAddress.address}
                        {order.shippingAddress.city
                          ? `, ${order.shippingAddress.city}`
                          : ""}
                      </p>

                      {order.shippingAddress.phone && (
                        <p>
                          {
                            order.shippingAddress
                              .phone
                          }
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}