import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { ShoppingCart, Star } from "lucide-react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const discountPct = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role === "seller") return;

    addToCart(product);
    setAdded(true);

    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {discountPct > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
              -{discountPct}%
            </span>
          )}

          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              Only {product.stock} left
            </span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
          {product.category}
        </p>

        <Link to={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 transition group-hover:text-green-600">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="text-sm font-medium text-gray-700">
              {product.rating}
            </span>

            <span className="text-sm text-gray-400">
              ({product.reviews})
            </span>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-gray-900">
            Rs. {product.price.toLocaleString()}
          </span>

          {product.originalPrice && (
            <span className="pb-1 text-sm text-gray-400 line-through">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {currentUser?.role !== "seller" && (
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition
              ${
                product.stock === 0
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : added
                  ? "bg-green-600 text-white"
                  : "bg-gray-900 text-white hover:bg-green-600"
              }`}
          >
            <ShoppingCart size={18} />

            {added
              ? "Added to Cart"
              : product.stock === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}