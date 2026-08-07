import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-5 items-center">
      {/* Product Image */}
      <div className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-lg border">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 w-full">
        <h3 className="text-lg font-semibold text-gray-900">
          {item.name}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Rs. {item.price.toLocaleString()} each
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">

          {/* Quantity */}
          <div className="flex items-center border rounded-lg overflow-hidden">

            <button
              onClick={() =>
                updateQuantity(item.productId, item.quantity - 1)
              }
              className="px-3 py-2 hover:bg-gray-100 transition"
            >
              <Minus size={16} />
            </button>

            <span className="px-4 font-medium">
              {item.quantity}
            </span>

            <button
              onClick={() =>
                updateQuantity(item.productId, item.quantity + 1)
              }
              className="px-3 py-2 hover:bg-gray-100 transition"
            >
              <Plus size={16} />
            </button>

          </div>

          {/* Remove */}
          <button
            onClick={() => removeFromCart(item.productId)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition"
          >
            <Trash2 size={18} />
            Remove
          </button>

        </div>
      </div>

      {/* Total */}
      <div className="text-right">
        <p className="text-sm text-gray-500">
          Total
        </p>

        <p className="text-xl font-bold text-green-600">
          Rs. {(item.price * item.quantity).toLocaleString()}
        </p>
      </div>
    </div>
  );
}