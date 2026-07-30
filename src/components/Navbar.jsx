import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🛍️</span>
          <span className="brand-text">BazaarNepal</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          {currentUser?.role === "seller" ? (
            <>
              <Link to="/seller/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/seller/products" className="nav-link" onClick={() => setMenuOpen(false)}>Products</Link>
              <Link to="/seller/promos" className="nav-link" onClick={() => setMenuOpen(false)}>Promo Codes</Link>
            </>
          ) : (
            <>
              <Link to="/cart" className="nav-link cart-link" onClick={() => setMenuOpen(false)}>
                <span>🛒 Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              {currentUser && (
                <Link to="/orders" className="nav-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          {currentUser ? (
            <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="user-avatar">{currentUser.avatar}</div>
              <span className="user-name">{currentUser.name?.split(" ")[0]}</span>
              <span className="chevron">▾</span>
              {dropdownOpen && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{currentUser.avatar}</div>
                    <div>
                      <div className="dropdown-name">{currentUser.name}</div>
                      <div className="dropdown-role">{currentUser.role === "seller" ? "🏪 Seller" : "🛒 Customer"}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-outline-sm">Login</Link>
              <Link to="/signup" className="btn-primary-sm">Sign Up</Link>
            </div>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </nav>
  );
}
