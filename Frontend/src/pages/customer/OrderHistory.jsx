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
  const orders = [...getOrdersByCustomer(currentUser?.id || "")].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);
 if (orders.length === 0) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 text-center max-w-md w-full">
        <div className="text-6xl mb-4">📦</div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          No orders yet
        </h2>

        <p className="text-gray-500 mb-6">
          Start shopping to see your orders here.
        </p>

        <Link
          to="/"
          className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition"
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        My Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="font-semibold text-lg">
                  Order #{order.id}
                </h2>

                <p className="text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("en-NP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <span
                className="px-4 py-2 rounded-full text-sm font-semibold w-fit"
                style={{
                  backgroundColor:
                    STATUS_COLORS[order.status] + "22",
                  color: STATUS_COLORS[order.status],
                }}
              >
                {order.status.charAt(0).toUpperCase() +
                  order.status.slice(1)}
              </span>
            </div>

            {/* Products */}
            <div className="divide-y mt-4">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between py-3"
                >
                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-violet-600">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 border-t pt-4 gap-4">

              <div className="space-y-1">
                {order.promoCode && (
                  <p className="text-green-600 text-sm">
                    🏷️ Promo: {order.promoCode}
                  </p>
                )}

                <p className="text-gray-600 text-sm">
                  💳 {order.paymentMethod}
                </p>
              </div>

              <div className="text-right">
                <p className="text-gray-500 text-sm">
                  Total
                </p>

                <h3 className="text-2xl font-bold text-violet-600">
                  Rs. {order.total.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
