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
    <div className="seller-page">
      <div className="container">
        <div className="seller-header">
          <div>
            <h1 className="page-title">
              Welcome back, <span className="gradient-text">{currentUser?.name?.split(" ")[0]}</span>!
            </h1>
            <p className="page-subtitle">{currentUser?.shopName || "Your Shop"}</p>
          </div>
          <div className="seller-header-actions">
            <Link to="/seller/products" className="btn-primary">+ Add Product</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-value">Rs. {stats.totalRevenue?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card orders">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{stats.totalOrders || 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card products">
            <div className="stat-icon">🏷️</div>
            <div className="stat-value">{stats.productCount || 0}</div>
            <div className="stat-label">Products Listed</div>
          </div>
          <div className="stat-card avg">
            <div className="stat-icon">📊</div>
            <div className="stat-value">
              Rs. {stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}
            </div>
            <div className="stat-label">Avg. Order Value</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Revenue Chart */}
          <div className="dashboard-card chart-card">
            <h3 className="card-title">📈 Monthly Revenue</h3>
            {Object.keys(stats.monthlySales || {}).length === 0 ? (
              <div className="no-data">No sales data yet</div>
            ) : (
              <div className="bar-chart">
                {Object.entries(stats.monthlySales || {}).map(([month, value]) => (
                  <div key={month} className="bar-item">
                    <div className="bar-label-top">Rs. {(value / 1000).toFixed(1)}k</div>
                    <div className="bar-wrap">
                      <div
                        className="bar"
                        style={{ height: `${(value / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <div className="bar-label">{month}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="dashboard-card">
            <h3 className="card-title">🏆 Top Products</h3>
            {stats.topProducts?.length === 0 ? (
              <div className="no-data">No sales yet</div>
            ) : (
              <div className="top-products-list">
                {stats.topProducts?.map((p, i) => (
                  <div key={i} className="top-product-item">
                    <div className="top-product-rank">#{i + 1}</div>
                    <div className="top-product-info">
                      <div className="top-product-name">{p.name}</div>
                      <div className="top-product-sales">{p.units} units sold</div>
                    </div>
                    <div className="top-product-revenue">Rs. {p.revenue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="low-stock-alert">
            <div className="alert-icon">⚠️</div>
            <div>
              <strong>Low Stock Alert:</strong>{" "}
              {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(", ")}
            </div>
            <Link to="/seller/products" className="alert-link">Manage →</Link>
          </div>
        )}

        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">📋 Recent Orders</h3>
          </div>
          {recentOrders.length === 0 ? (
            <div className="no-data">No orders yet. Share your products!</div>
          ) : (
            <div className="orders-table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Revenue</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="mono">#{order.id.slice(-6)}</td>
                      <td>{order.customerName}</td>
                      <td>{order.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                      <td>Rs. {order.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}</td>
                      <td>
                        <span
                          className="order-status-badge"
                          style={{
                            background: STATUS_COLORS[order.status] + "22",
                            color: STATUS_COLORS[order.status],
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
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
