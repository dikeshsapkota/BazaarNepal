import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useStore();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

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
    <div className="product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="product-detail-grid">
          <div className="product-detail-image-wrap">
            <img src={product.image} alt={product.name} className="product-detail-img" />
            {discountPct > 0 && <div className="detail-discount-badge">-{discountPct}% OFF</div>}
          </div>
          <div className="product-detail-info">
            <div className="product-detail-category">{product.category}</div>
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-detail-rating">
              <span className="stars-lg">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</span>
              <span>{product.rating} ({product.reviews} reviews)</span>
            </div>
            <div className="product-detail-price">
              <span className="detail-price">Rs. {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="detail-original">Rs. {product.originalPrice.toLocaleString()}</span>
                  <span className="detail-savings">You save Rs. {(product.originalPrice - product.price).toLocaleString()}</span>
                </>
              )}
            </div>
            <p className="product-detail-desc">{product.description}</p>
            <div className="product-detail-tags">
              {product.tags?.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
            <div className="stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-stock">✗ Out of Stock</span>
              )}
            </div>
            {currentUser?.role !== "seller" && product.stock > 0 && (
              <div className="purchase-controls">
                <div className="qty-selector">
                  <label>Quantity:</label>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                    <span className="qty-value">{qty}</span>
                    <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                  </div>
                </div>
                <div className="action-buttons">
                  <button className={`add-to-cart-btn-lg ${added ? "added" : ""}`} onClick={handleAddToCart}>
                    {added ? "✓ Added to Cart!" : "🛒 Add to Cart"}
                  </button>
                  <button className="buy-now-btn" onClick={handleBuyNow}>⚡ Buy Now</button>
                </div>
              </div>
            )}
            {!currentUser && (
              <div className="login-prompt">
                <p>Please <button onClick={() => navigate("/login")} className="inline-link">login</button> to purchase</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
