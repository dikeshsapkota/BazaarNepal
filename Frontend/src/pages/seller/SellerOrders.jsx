import { useEffect, useState } from "react";
import {
    getSellerOrders,
    updateOrderStatus,
} from "../../api/orderApi";
import { Package, CreditCard } from "lucide-react";

const STATUS_COLORS = {
    processing: "#f59e0b",
    confirmed: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444",
};

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const { data } = await getSellerOrders();

                setOrders(data.orders);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load seller orders."
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);
const handleStatusChange = async (orderId, newStatus) => {
  try {
    const { data } = await updateOrderStatus(orderId, newStatus);

    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId
          ? { ...order, status: data.order.status }
          : order
      )
    );
  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
        "Failed to update order status."
    );
  }
};
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">
                    Loading seller orders...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl border shadow-sm p-10 text-center max-w-md w-full">
                    <Package className="mx-auto h-16 w-16 text-violet-500 mb-4" />

                    <h2 className="text-2xl font-bold text-gray-900">
                        No orders yet
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Orders containing your products will appear here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Seller Orders
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage orders containing your products.
                    </p>
                </div>

                <div className="space-y-6">

                    {orders.map((order) => {
                        const statusColor =
                            STATUS_COLORS[order.status] || "#6b7280";

                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
                            >

                                {/* Order Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">

                                    <div>
                                        <h2 className="font-semibold text-lg">
                                            Order #{order._id.slice(-8).toUpperCase()}
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
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

                                        <div className="flex items-center gap-2">
                                           

                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(order._id, e.target.value)
                                                    }
                                                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                                                >
                                                    <option value="processing">Processing</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>

                                                <span
                                                    className="px-3 py-2 rounded-full text-xs font-semibold"
                                                    style={{
                                                        backgroundColor: statusColor + "22",
                                                        color: statusColor,
                                                    }}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            className={`px-4 py-2 rounded-full text-sm font-semibold ${order.paymentStatus === "paid"
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

                                {/* Customer */}
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">
                                        Customer
                                    </p>

                                    <p className="font-semibold">
                                        {order.customer?.name || "Customer"}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {order.customer?.email}
                                    </p>
                                </div>

                                {/* Seller Items */}
                                <div className="divide-y mt-5">

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
                                                        alt={item.product.name}
                                                        className="h-20 w-20 rounded-xl object-cover border"
                                                    />
                                                ) : (
                                                    <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center">
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-semibold">
                                                        {item.product?.name ||
                                                            "Product unavailable"}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        Qty: {item.quantity}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        Rs.{" "}
                                                        {Number(item.price).toLocaleString()}{" "}
                                                        each
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="font-bold text-violet-600">
                                                Rs.{" "}
                                                {(
                                                    Number(item.price) *
                                                    Number(item.quantity)
                                                ).toLocaleString()}
                                            </p>

                                        </div>
                                    ))}

                                </div>

                                {/* Footer */}
                                <div className="mt-5 border-t pt-4 flex flex-col md:flex-row justify-between gap-4">

                                    <div className="text-sm text-gray-600">

                                        <p className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            {order.paymentMethod || "eSewa"}
                                        </p>

                                        {order.shippingAddress && (
                                            <div className="mt-2">

                                                <p>
                                                    {order.shippingAddress.address}
                                                    {order.shippingAddress.city
                                                        ? `, ${order.shippingAddress.city}`
                                                        : ""}
                                                </p>

                                                <p>
                                                    {order.shippingAddress.phone}
                                                </p>

                                            </div>
                                        )}

                                    </div>

                                    <div className="text-right">

                                        <p className="text-sm text-gray-500">
                                            Seller Order Total
                                        </p>

                                        <p className="text-2xl font-bold text-violet-600">
                                            Rs.{" "}
                                            {order.items
                                                .reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        Number(item.price) *
                                                        Number(item.quantity),
                                                    0
                                                )
                                                .toLocaleString()}
                                        </p>

                                    </div>

                                </div>

                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
}