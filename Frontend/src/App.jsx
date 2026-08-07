import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { StoreProvider } from "./context/StoreContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderHistory from "./pages/customer/OrderHistory";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerOrders from "./pages/seller/SellerOrders";
import ManageProducts from "./pages/seller/ManageProducts";
import PromoCodes from "./pages/seller/PromoCodes";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/order-success" element={<OrderSuccess />} />

                  {/* Customer Routes */}
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />

                  {/* Seller Routes */}
                  <Route
                    path="/seller/dashboard"
                    element={
                      <ProtectedRoute requiredRole="seller">
                        <SellerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/products"
                    element={
                      <ProtectedRoute requiredRole="seller">
                        <ManageProducts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/orders"
                    element={
                      <ProtectedRoute requiredRole="seller">
                        <SellerOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/promos"
                    element={
                      <ProtectedRoute requiredRole="seller">
                        <PromoCodes />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>
            </div>
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
