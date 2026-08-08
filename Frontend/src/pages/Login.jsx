import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, ShoppingCart, Store } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] =useState(false);

 const demoAccounts = {
  customer: {
    email: "dikesh@test.com",
    password: "1234567",
  },
  seller: {
    email: "seller@example.com",
    password: "123456",
  },
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const result = await login(form.email, form.password);

    if (result.success) {

  if (result.user.role !== role) {
    setError(`This account is a ${result.user.role}. Please select the correct tab.`);
    setLoading(false);
    return;
  }

  navigate(
    result.user.role === "seller"
      ? "/seller/dashboard"
      : "/"
  );

} else {
  setError(result.error);
}

    setLoading(false);
  };

  const fillDemo = () => {
    setForm(demoAccounts[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-100 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <div className="text-center mb-8">

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 text-3xl font-bold text-violet-600"
          >
            <ShoppingBag className="h-8 w-8" aria-hidden="true" />
            BazaarNepal
          </Link>

          <h1 className="text-3xl font-bold mt-5">
            Welcome Back
          </h1>

          <p className="text-gray-500 mt-2">
            Sign in to your account
          </p>

        </div>

        {/* Role Tabs */}

        <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-6">

          <button
            type="button"
            onClick={() => {
              setRole("customer");
              setError("");
            }}
            className={`inline-flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
              role === "customer"
                ? "bg-violet-600 text-white shadow"
                : "text-gray-600"
            }`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Customer
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("seller");
              setError("");
            }}
            className={`inline-flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition ${
              role === "seller"
                ? "bg-violet-600 text-white shadow"
                : "text-gray-600"
            }`}
          >
            <Store className="h-4 w-4" aria-hidden="true" />
            Seller
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div>

            <label className="block text-sm font-medium mb-2">
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              required
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              required
            />

          </div>

          <button
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {loading
              ? "Signing In..."
              : `Sign In as ${
                  role === "customer"
                    ? "Customer"
                    : "Seller"
                }`}
          </button>

        </form>

        <div className="mt-8 border-t pt-6">

          <p className="text-center text-sm text-gray-500 mb-4">
            Try a demo account
          </p>

          <button
            onClick={fillDemo}
            className="w-full border border-violet-600 text-violet-600 py-3 rounded-xl hover:bg-violet-50 transition font-medium"
          >
            Fill {role === "customer"
              ? "Customer"
              : "Seller"} Demo Credentials
          </button>

        </div>

        <div className="text-center mt-8 text-sm">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="text-violet-600 font-semibold hover:underline"
          >
            Create one
          </Link>

        </div>

      </div>

    </div>
  );
}
