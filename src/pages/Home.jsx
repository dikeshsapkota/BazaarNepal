import { useState, useMemo } from "react";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["All", "Electronics", "Fashion", "Food & Beverages", "Sports & Fitness", "Art & Crafts"];

export default function Home() {
  const { products } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "discount":
        list.sort((a, b) => {
          const da = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
          const db = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
          return db - da;
        });
        break;
      default: break;
    }
    return list;
  }, [products, search, category, sort]);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🇳🇵 Nepal's Premier Marketplace</div>
          <h1 className="hero-title">
            Discover <span className="gradient-text">Authentic</span> Nepali Products
          </h1>
          <p className="hero-subtitle">
            From handcrafted treasures to modern electronics — shop directly from trusted local sellers
          </p>
          <div className="hero-search">
            <span className="search-icon-hero">🔍</span>
            <input
              type="text"
              placeholder="Search products, brands, or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hero-search-input"
            />
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">{products.length}+</span><span className="stat-label">Products</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">2</span><span className="stat-label">Trusted Sellers</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">3</span><span className="stat-label">Active Promos</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-float-card card-1">
            <span>🎧</span>
            <div>
              <div className="fc-name">Headphones</div>
              <div className="fc-price">Rs. 4,999</div>
            </div>
          </div>
          <div className="hero-float-card card-2">
            <span>🍯</span>
            <div>
              <div className="fc-name">Himalayan Honey</div>
              <div className="fc-price">Rs. 850</div>
            </div>
          </div>
          <div className="hero-float-card card-3">
            <span>🏷️</span>
            <div>
              <div className="fc-name">Use WELCOME15</div>
              <div className="fc-price">15% OFF</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="categories-section">
        <div className="container">
          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="products-section">
        <div className="container">
          <div className="products-header">
            <div className="section-title-group">
              <h2 className="section-title">
                {category === "All" ? "All Products" : category}
                <span className="product-count"> ({filtered.length})</span>
              </h2>
            </div>
            <div className="sort-control">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span>🔍</span>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter</p>
              <button onClick={() => { setSearch(""); setCategory("All"); }} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container">
          <div className="promo-cards">
            <div className="promo-card">
              <div className="promo-icon">🎁</div>
              <div>
                <div className="promo-code-display">TECH20</div>
                <div className="promo-desc">20% off electronics — min. Rs. 1,000</div>
              </div>
            </div>
            <div className="promo-card">
              <div className="promo-icon">💰</div>
              <div>
                <div className="promo-code-display">NEPAL500</div>
                <div className="promo-desc">Flat Rs. 500 off — min. Rs. 2,000</div>
              </div>
            </div>
            <div className="promo-card">
              <div className="promo-icon">🌟</div>
              <div>
                <div className="promo-code-display">WELCOME15</div>
                <div className="promo-desc">15% off for new users — min. Rs. 500</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-icon">🛍️</span> BazaarNepal
              <p>Nepal's trusted e-commerce marketplace</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Quick Links</h4>
                <a href="/">Home</a>
                <a href="/login">Login</a>
                <a href="/signup">Sign Up</a>
              </div>
              <div className="footer-col">
                <h4>Payment</h4>
                <div className="payment-badges">
                  <span className="payment-badge esewa">eSewa</span>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            © 2025 BazaarNepal. Created by{" "}
            <a href="https://dikeshsapkota.com.np" target="_blank" rel="noreferrer">
              Dikesh sapkota
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
