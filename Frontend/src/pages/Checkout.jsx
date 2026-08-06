import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { initiateEsewaPayment, generateTransactionId } from "../utils/esewa";

export default function Checkout() {
  const { cartItems, cartTotal, discount, finalTotal, appliedPromo, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { placeOrder } = useStore();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [form, setForm] = useState({
    fullName: currentUser?.name || "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

 useEffect(() => {
  if (cartItems.length === 0) {
    navigate("/cart");
  }
}, [cartItems, navigate]);

if (cartItems.length === 0) {
  return null;
}

  const handleEsewaPayment = async (e) => {
    e.preventDefault();
    setPaying(true);

    // Place the order first (save to localStorage)
    const transactionId = generateTransactionId();
    const order = placeOrder({
      customerId: currentUser._id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      shippingAddress: { ...form },
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sellerId: item.sellerId,
      })),
      subtotal: cartTotal,
      discount,
      total: finalTotal,
      promoCode: appliedPromo?.code || null,
      paymentMethod: "eSewa",
      transactionId,
    });

    // Save pending order info for success page
    localStorage.setItem("ecom_pending_order", JSON.stringify(order));
    clearCart();

    // Initiate eSewa payment
    try {
      await initiateEsewaPayment({
        amount: finalTotal,
        taxAmount: 0,
        serviceCharge: 0,
        deliveryCharge: 0,
        orderId: transactionId,
      });
    } catch (err) {
      console.error("eSewa payment error:", err);
      // Fallback: go to success page directly for demo
      navigate("/order-success");
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 py-10">
    <div className="mx-auto max-w-7xl px-6">

      <h1 className="mb-10 text-4xl font-bold text-gray-900">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">

        {/* Shipping Form */}

        <div className="lg:col-span-2">

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

            <h3 className="mb-8 text-2xl font-bold text-gray-900">
              📦 Shipping Information
            </h3>

            <form
              id="checkout-form"
              onSubmit={handleEsewaPayment}
              className="space-y-6"
            >

              <div className="grid gap-6 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fullName: e.target.value,
                      })
                    }
                    required
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    required
                    placeholder="98XXXXXXXX"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Delivery Address
                </label>

                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: e.target.value,
                    })
                  }
                  required
                  placeholder="Street address, ward number..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />

              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    City / District
                  </label>

                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        city: e.target.value,
                      })
                    }
                    required
                    placeholder="Kathmandu"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Order Notes (Optional)
                  </label>

                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Special instructions..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />

                </div>

              </div>

            </form>

          </div>

        </div>
      
 {/* Order Summary */}
<div className="space-y-6">

  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

    <h3 className="mb-6 text-2xl font-bold text-gray-900">
      🛒 Order Summary
    </h3>

    {/* Cart Items */}

    <div className="space-y-4">

      {cartItems.map((item) => (
        <div
          key={item.productId}
          className="flex items-center gap-4 rounded-xl border border-gray-100 p-3"
        >

          <img
            src={item.image}
            alt={item.name}
            className="h-16 w-16 rounded-lg object-cover"
          />

          <div className="flex-1">

            <h4 className="font-semibold text-gray-900">
              {item.name}
            </h4>

            <p className="text-sm text-gray-500">
              Qty: {item.quantity}
            </p>

          </div>

          <div className="font-semibold text-green-600">
            Rs. {(item.price * item.quantity).toLocaleString()}
          </div>

        </div>
      ))}

    </div>

    <hr className="my-6 border-gray-200" />

    <div className="space-y-3">

      <div className="flex justify-between text-gray-700">
        <span>Subtotal</span>
        <span className="font-medium">
          Rs. {cartTotal.toLocaleString()}
        </span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>
            Promo ({appliedPromo?.code})
          </span>

          <span>
            - Rs. {discount.toLocaleString()}
          </span>
        </div>
      )}

      <div className="flex justify-between text-gray-700">
        <span>Shipping</span>

        <span className="font-medium text-green-600">
          FREE
        </span>
      </div>

    </div>

    <hr className="my-6 border-gray-200" />

    <div className="flex justify-between text-2xl font-bold text-gray-900">

      <span>Total</span>

      <span className="text-green-600">
        Rs. {finalTotal.toLocaleString()}
      </span>

    </div>

  </div>

  {/* Pay Button */}

  <button
    type="submit"
    form="checkout-form"
    disabled={paying}
    className="flex w-full items-center justify-center rounded-2xl bg-green-600 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
  >
    {paying ? (
      <svg
        className="h-6 w-6 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />

        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    ) : (
      <>
        <span className="mr-3 rounded-md bg-white px-2 py-1 text-sm font-bold text-green-600">
          eSewa
        </span>

        Pay Rs. {finalTotal.toLocaleString()}
      </>
    )}
  </button>

  {/* Security */}

  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
    🔒 256-bit SSL encrypted checkout
  </div>

</div>   {/* Order Summary */}

</div>   {/* grid */}

</div>   {/* container */}

</div> 
  );
}
