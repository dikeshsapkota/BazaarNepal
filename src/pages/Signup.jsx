import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const userData = {
      name: form.name,
      email: form.email,
      password: form.password,
      role,
      ...(role === "seller" && {
        shopName: form.shopName,
        description: form.description,
      }),
    };
    const result = signup(userData);
    if (result.success) {
      navigate(role === "seller" ? "/seller/dashboard" : "/");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🛍️ BazaarNepal</Link>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join thousands of buyers and sellers</p>
        </div>

        <div className="role-tabs">
          <button
            className={`role-tab ${role === "customer" ? "active" : ""}`}
            onClick={() => { setRole("customer"); setError(""); }}
          >
            🛒 Customer
          </button>
          <button
            className={`role-tab ${role === "seller" ? "active" : ""}`}
            onClick={() => { setRole("seller"); setError(""); }}
          >
            🏪 Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="form-input"
              />
            </div>
          </div>

          {role === "seller" && (
            <div className="form-row">
              <div className="form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  placeholder="Your shop name"
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Shop Description</label>
                <input
                  type="text"
                  placeholder="Brief description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className={`auth-submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : `Create ${role === "customer" ? "Customer" : "Seller"} Account`}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
