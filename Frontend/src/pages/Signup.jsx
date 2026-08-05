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

  const userData = {
    name: form.name,
    email: form.email,
    password: form.password,
    role,
    shopName: role === "seller" ? form.shopName : "",
    phone: "",
  };

  const result = await signup(userData);

  if (result.success) {
    navigate(role === "seller" ? "/seller/dashboard" : "/");
  } else {
    setError(result.error);
  }

  setLoading(false);
};

  return (<div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-100 flex items-center justify-center px-4 py-10">

    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">

      {/* Header */}
      <div className="text-center mb-8">
        <Link
          to="/"
          className="text-3xl font-bold text-violet-600"
        >
          🛍️ BazaarNepal
        </Link>

        <h1 className="text-3xl font-bold mt-5">
          Create Account
        </h1>

        <p className="text-gray-500 mt-2">
          Join thousands of buyers and sellers
        </p>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-8">

        <button
          type="button"
          onClick={() => {
            setRole("customer");
            setError("");
          }}
          className={`py-3 rounded-lg font-medium transition-all ${role === "customer"
              ? "bg-violet-600 text-white shadow"
              : "text-gray-600 hover:bg-gray-200"
            }`}
        >
          🛒 Customer
        </button>

        <button
          type="button"
          onClick={() => {
            setRole("seller");
            setError("");
          }}
          className={`py-3 rounded-lg font-medium transition-all ${role === "seller"
              ? "bg-violet-600 text-white shadow"
              : "text-gray-600 hover:bg-gray-200"
            }`}
        >
          🏪 Seller
        </button>

      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

        </div>
        {role === "seller" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name
              </label>

              <input
                type="text"
                placeholder="Your shop name"
                value={form.shopName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    shopName: e.target.value,
                  })
                }
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Description
              </label>

              <input
                type="text"
                placeholder="Brief description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? "Creating Account..."
            : `Create ${role === "customer" ? "Customer" : "Seller"
            } Account`}
        </button>

        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  </div>
      );
}
