import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoAccounts = {
    customer: { email: "customer@gmail.com", password: "customer123" },
    seller: { email: "seller@techmart.com", password: "techmart123" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(form.email, form.password, role);
    if (result.success) {
      navigate(result.user.role === "seller" ? "/seller/dashboard" : "/");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const fillDemo = () => {
    const demo = demoAccounts[role];
    setForm(demo);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🛍️ BazaarNepal</Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
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

          <button type="submit" className={`auth-submit-btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? <span className="btn-spinner" /> : `Sign In as ${role === "customer" ? "Customer" : "Seller"}`}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-label">Try a demo account</p>
          <button className="demo-btn" onClick={fillDemo}>
            Fill {role === "customer" ? "Customer" : "Seller"} Demo Credentials
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  );
}
