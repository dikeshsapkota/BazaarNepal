import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { ArrowLeft, Check, Minus, Plus, ShoppingCart, Star, XCircle, Zap } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useStore();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p._id === id);

  if (!product) {
    return (
      <div className="not-found-page">
        <h1>Product not found</h1>
        <button onClick={() => navigate("/")} className="btn-primary">Go Home</button>
      </div>
    );
  }

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!currentUser) { navigate("/login"); return; }
    if (currentUser.role === "seller") return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!currentUser) { navigate("/login"); return; }
    addToCart(product, qty);
    navigate("/cart");
  };

  return (
  <div className="min-h-screen bg-gray-50 py-10">
    <div className="max-w-7xl mx-auto px-4">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl shadow-lg p-8">

        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[500px] object-cover rounded-2xl"
          />

          {discountPct > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              -{discountPct}% OFF
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">

          <span className="text-sm font-medium text-violet-600 uppercase">
            {product.category}
          </span>

          <h1 className="text-4xl font-bold text-gray-900 mt-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mt-4">
            <span className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className="h-5 w-5"
                  fill={index < Math.round(product.rating ?? 0) ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              ))}
            </span>

            <span className="text-gray-500">
             {product.rating ?? 0} ({product.reviews ?? 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mt-6 flex flex-wrap items-center gap-4">

            <span className="text-4xl font-bold text-violet-600">
              Rs. {product.price.toLocaleString()}
            </span>

            {product.originalPrice && (
              <>
                <span className="text-gray-400 line-through text-xl">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Save Rs. {(product.originalPrice - product.price).toLocaleString()}
                </span>
              </>
            )}

          </div>

          {/* Description */}
          <p className="mt-6 text-gray-600 leading-7">
            {product.description}
          </p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="mt-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
                <Check className="h-4 w-4" aria-hidden="true" />
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 px-4 py-2 text-sm font-medium">
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Purchase */}
          {currentUser?.role !== "seller" && product.stock > 0 && (
            <div className="mt-8">

              <div className="flex items-center gap-4 mb-6">

                <span className="font-medium">
                  Quantity
                </span>

                <div className="flex items-center border rounded-xl overflow-hidden">

                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <span className="px-5 font-semibold">
                    {qty}
                  </span>

                  <button
                    onClick={() =>
                      setQty(Math.min(product.stock, qty + 1))
                    }
                    className="px-4 py-2 hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>

                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-4">

                <button
                  onClick={handleAddToCart}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold transition ${
                    added
                      ? "bg-green-600 text-white"
                      : "bg-violet-600 hover:bg-violet-700 text-white"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5" aria-hidden="true" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 border-2 border-violet-600 text-violet-600 hover:bg-violet-50 font-semibold transition"
                >
                  <Zap className="h-5 w-5" aria-hidden="true" />
                  Buy Now
                </button>

              </div>

            </div>
          )}

          {!currentUser && (
            <div className="mt-8 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-yellow-800">
                Please{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="font-semibold text-violet-600 hover:underline"
                >
                  login
                </button>{" "}
                to purchase this product.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  </div>

);}
