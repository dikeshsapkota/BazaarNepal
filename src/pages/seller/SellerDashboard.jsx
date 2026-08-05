import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  processing: "#f59e0b",
  shipped: "#3b82f6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function SellerDashboard() {
  const { currentUser } = useAuth();
  const { getSellerStats, getOrdersBySeller, getProductsBySeller } = useStore();

  const stats = getSellerStats(currentUser?.id);
  const recentOrders = getOrdersBySeller(currentUser?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const products = getProductsBySeller(currentUser?.id);
  const lowStockProducts = products.filter((p) => p.stock <= 5 && p.stock > 0);

  const maxRevenue = Math.max(...Object.values(stats.monthlySales || {}), 1);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                {currentUser?.name?.split(" ")[0]}
              </span>
              !
            </h1>

            <p className="text-gray-500 mt-2 text-lg">
              {currentUser?.shopName || "Your Shop"}
            </p>
          </div>

          <Link
            to="/seller/products"
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
          >
            + Add Product
          </Link>
        </div>

       {/* Stats */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

  {/* Revenue */}
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
    <div className="text-4xl mb-4">💰</div>

    <h2 className="text-3xl font-bold text-violet-600">
      Rs. {stats.totalRevenue?.toLocaleString() || 0}
    </h2>

    <p className="text-gray-500 mt-2">
      Total Revenue
    </p>
  </div>

  {/* Orders */}
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
    <div className="text-4xl mb-4">📦</div>

    <h2 className="text-3xl font-bold text-blue-600">
      {stats.totalOrders || 0}
    </h2>

    <p className="text-gray-500 mt-2">
      Total Orders
    </p>
  </div>

  {/* Products */}
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
    <div className="text-4xl mb-4">🏷️</div>

    <h2 className="text-3xl font-bold text-green-600">
      {stats.productCount || 0}
    </h2>

    <p className="text-gray-500 mt-2">
      Products Listed
    </p>
  </div>

  {/* Average Order */}
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
    <div className="text-4xl mb-4">📊</div>

    <h2 className="text-3xl font-bold text-orange-500">
      Rs.{" "}
      {stats.totalOrders > 0
        ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString()
        : 0}
    </h2>

    <p className="text-gray-500 mt-2">
      Avg. Order Value
    </p>
  </div>

</div>





        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

          {/* Revenue Chart */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              📈 Monthly Revenue
            </h3>

            {Object.keys(stats.monthlySales || {}).length === 0 ? (
              <div className="flex items-center justify-center h-72 text-gray-400">
                No sales data yet
              </div>
            ) : (
              <div className="flex items-end justify-between gap-4 h-72">
                {Object.entries(stats.monthlySales || {}).map(([month, value]) => (
                  <div
                    key={month}
                    className="flex flex-col items-center flex-1"
                  >
                    <span className="text-xs text-gray-500 mb-2">
                      Rs. {(value / 1000).toFixed(1)}k
                    </span>

                    <div className="w-full flex justify-center h-52 items-end">
                      <div
                        className="w-10 rounded-t-xl bg-gradient-to-t from-violet-600 to-violet-400 hover:opacity-90 transition"
                        style={{
                          height: `${(value / maxRevenue) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="mt-3 text-sm font-medium text-gray-600">
                      {month}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              🏆 Top Products
            </h3>

            {stats.topProducts?.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                No sales yet
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topProducts?.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 font-bold flex items-center justify-center">
                        #{i + 1}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          {p.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {p.units} units sold
                        </p>
                      </div>
                    </div>

                    <p className="font-bold text-violet-600">
                      Rs. {p.revenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
</div>
      

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="mb-8 rounded-2xl border border-yellow-300 bg-yellow-50 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">⚠️</div>

              <div>
                <p className="font-semibold text-yellow-800">
                  Low Stock Alert
                </p>

                <p className="text-yellow-700">
                  {lowStockProducts
                    .map((p) => `${p.name} (${p.stock} left)`)
                    .join(", ")}
                </p>
              </div>
            </div>

            <Link
              to="/seller/products"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl transition"
            >
              Manage →
            </Link>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            📋 Recent Orders
          </h3>

          {recentOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No orders yet. Share your products!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-600">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono">
                        #{order.id.slice(-6)}
                      </td>

                      <td className="px-4 py-3">
                        {order.customerName}
                      </td>

                      <td className="px-4 py-3">
                        {order.items.reduce(
                          (s, i) => s + i.quantity,
                          0
                        )}{" "}
                        items
                      </td>

                      <td className="px-4 py-3 font-semibold text-violet-600">
                        Rs.{" "}
                        {order.items
                          .reduce(
                            (s, i) => s + i.price * i.quantity,
                            0
                          )
                          .toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[order.status] + "22",
                            color: STATUS_COLORS[order.status],
                          }}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
}
