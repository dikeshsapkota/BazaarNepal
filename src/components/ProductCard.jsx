import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
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
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-link">
        <div className="product-image-wrap">
          <img src={product.image} alt={product.name} className="product-img" loading="lazy" />
          {discountPct > 0 && <span className="discount-badge">-{discountPct}%</span>}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="stock-badge">Only {product.stock} left!</span>
          )}
          {product.stock === 0 && <span className="out-of-stock-badge">Out of Stock</span>}
        </div>
      </Link>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link to={`/product/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-rating">
          <span className="stars">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>
        <div className="product-pricing">
          <span className="current-price">Rs. {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="original-price">Rs. {product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        {currentUser?.role !== "seller" && (
          <button
            className={`add-to-cart-btn ${added ? "added" : ""} ${product.stock === 0 ? "disabled" : ""}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {added ? "✓ Added!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}
