import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserRound,
  X,
} from "lucide-react";

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-violet-600 font-bold text-xl">
          <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          <span>BazaarNepal</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-violet-600 transition-colors">
            Home
          </Link>

          {currentUser?.role === "seller" ? (
            <>
              <Link
                to="/seller/dashboard"
                className="text-sm text-gray-600 hover:text-violet-600 transition-colors"
              >
                Dashboard
              </Link>

              <Link
                to="/seller/products"
                className="text-sm text-gray-600 hover:text-violet-600 transition-colors"
              >
                Products
              </Link>

              <Link
                to="/seller/orders"
                className="text-sm text-gray-600 hover:text-violet-600 transition-colors"
              >
                Orders
              </Link>

              <Link
                to="/seller/promos"
                className="text-sm text-gray-600 hover:text-violet-600 transition-colors"
              >
                Promo Codes
              </Link>
            </>
          ) : (
            <>
              <Link to="/cart" className="relative text-sm text-gray-600 hover:text-violet-600 transition-colors flex items-center gap-1">
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-violet-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {currentUser && (
                <Link to="/orders" className="text-sm text-gray-600 hover:text-violet-600 transition-colors">
                  My Orders
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg">{currentUser.avatar}</span>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {currentUser.name?.split(" ")[0]}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                      {currentUser.role === "seller" ? (
                        <Store className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {currentUser.role === "seller" ? "Seller" : "Customer"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="px-4 py-1.5 text-sm font-medium text-violet-600 border border-violet-600 rounded-lg hover:bg-violet-50 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
                Sign Up
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-lg"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link to="/" onClick={closeMenu} className="py-2.5 text-sm text-gray-700 hover:text-violet-600 transition-colors">
            Home
          </Link>

          {currentUser?.role === "seller" ? (
            <>
              <Link to="/seller/dashboard" onClick={closeMenu} className="py-2.5 text-sm text-gray-700 hover:text-violet-600 transition-colors">Dashboard</Link>
              <Link
                to="/seller/orders"
                className="text-sm text-gray-600 hover:text-violet-600 transition-colors" >Orders</Link>
              <Link to="/seller/products" onClick={closeMenu} className="py-2.5 text-sm text-gray-700 hover:text-violet-600 transition-colors">Products</Link>
              <Link to="/seller/promos" onClick={closeMenu} className="py-2.5 text-sm text-gray-700 hover:text-violet-600 transition-colors">Promo Codes</Link>
            </>
          ) : (
            <>
              <Link to="/cart" onClick={closeMenu} className="py-2.5 text-sm text-gray-700 hover:text-violet-600 transition-colors">
                <span className="inline-flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  Cart
                  {cartCount > 0 && <span className="ml-1 bg-violet-600 text-white text-xs px-1.5 py-0.5 rounded-full">{cartCount}</span>}
                </span>
              </Link>
              {currentUser && (
                <Link to="/orders" onClick={closeMenu} className="py-2.5 text-sm text-gray-700 hover:text-violet-600 transition-colors">My Orders</Link>
              )}
            </>
          )}

          {!currentUser && (
            <div className="flex gap-2 pt-2 border-t border-gray-100 mt-1">
              <Link to="/login" onClick={closeMenu} className="flex-1 text-center py-2 text-sm font-medium text-violet-600 border border-violet-600 rounded-lg hover:bg-violet-50 transition-colors">
                Login
              </Link>
              <Link to="/signup" onClick={closeMenu} className="flex-1 text-center py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
