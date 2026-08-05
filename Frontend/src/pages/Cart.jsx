import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import CartItem from "../components/CartItem";

export default function Cart() {
  const { cartItems, cartTotal, discount, finalTotal, appliedPromo, applyPromo, removePromo, clearCart } = useCart();
  const { validatePromoCode } = useStore();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError("");
    setPromoSuccess("");
    setPromoLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = validatePromoCode(promoInput.trim(), cartTotal);
    if (result.valid) {
      applyPromo(result.promo);
      setPromoSuccess(`🎉 "${result.promo.code}" applied! You save Rs. ${
        result.promo.type === "percentage"
          ? Math.round((cartTotal * result.promo.discount) / 100).toLocaleString()
          : result.promo.discount.toLocaleString()
      }`);
      setPromoInput("");
    } else {
      setPromoError(result.error);
    }
    setPromoLoading(false);
  };

  if (cartItems.length === 0) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-lg border border-gray-200">

        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl">
          🛒
        </div>

        <h2 className="text-3xl font-bold text-gray-900">
          Your Cart is Empty
        </h2>

        <p className="mt-3 text-gray-500">
          Looks like you haven't added any products yet.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Continue Shopping
        </Link>

      </div>
    </div>
  );
}
    
return (
  <div className="min-h-screen bg-gray-50 py-10">
    <div className="mx-auto max-w-7xl px-6">

      {/* Page Title */}

      <h1 className="mb-10 text-4xl font-bold text-gray-900">
        Shopping Cart
        <span className="ml-2 text-lg font-medium text-gray-500">
          ({cartItems.length} items)
        </span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">

        {/* Cart Items */}

        <div className="space-y-5 lg:col-span-2">

          {cartItems.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
            />
          ))}

          <button
            onClick={clearCart}
            className="rounded-xl border border-red-300 px-5 py-3 font-medium text-red-600 transition hover:bg-red-50"
          >
            🗑 Clear Cart
          </button>

        </div>

        {/* Order Summary */}

        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h3 className="mb-6 text-2xl font-bold text-gray-900">
            Order Summary
          </h3>

          <div className="flex justify-between py-3 text-gray-700">
            <span>Subtotal</span>
            <span className="font-semibold">
              Rs. {cartTotal.toLocaleString()}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between py-3 text-green-600">
              <span>
                Discount ({appliedPromo.code})
              </span>

              <span>
                - Rs. {discount.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between py-3 text-gray-700">
            <span>Shipping</span>

            <span className="font-semibold text-green-600">
              FREE
            </span>
          </div>

          <hr className="my-5 border-gray-200" />

          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>

            <span>
              Rs. {finalTotal.toLocaleString()}
            </span>
          </div>

                      {/* Promo Code */}
          <div className="mt-8">

            <h4 className="mb-4 text-lg font-semibold text-gray-900">
              🏷️ Promo Code
            </h4>

            {appliedPromo ? (

              <div className="flex items-center justify-between rounded-xl bg-green-50 p-4 border border-green-200">

                <span className="font-medium text-green-700">
                  ✓ {appliedPromo.code}
                </span>

                <button
                  onClick={() => {
                    removePromo();
                    setPromoSuccess("");
                  }}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>

              </div>

            ) : (

              <div className="space-y-3">

                <div className="flex gap-3">

                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoError("");
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleApplyPromo()
                    }
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />

                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className="rounded-xl bg-green-600 px-6 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {promoLoading ? "..." : "Apply"}
                  </button>

                </div>

              </div>

            )}

            {promoError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {promoError}
              </div>
            )}

            {promoSuccess && (
              <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {promoSuccess}
              </div>
            )}

          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-8 w-full rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition hover:bg-green-700"
          >
            Proceed to Checkout →
          </button>

          <div className="mt-5 rounded-xl bg-green-50 p-4 text-center text-sm text-green-700">
            🔒 Secure checkout with eSewa
          </div>

        </div>
      </div>
    </div>
  </div>
);
}