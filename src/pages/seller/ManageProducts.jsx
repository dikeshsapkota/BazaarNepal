import { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["Electronics", "Fashion", "Food & Beverages", "Sports & Fitness", "Art & Crafts", "Home & Garden", "Books", "Other"];

const EMPTY_FORM = {
  name: "",
  category: "Electronics",
  price: "",
  originalPrice: "",
  stock: "",
  image: "",
  description: "",
  tags: "",
};

export default function ManageProducts() {
  const { currentUser } = useAuth();
  const { getProductsBySeller, addProduct, updateProduct, deleteProduct } = useStore();
  const products = getProductsBySeller(currentUser?.id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saved, setSaved] = useState(false);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || "",
      stock: product.stock,
      image: product.image,
      description: product.description,
      tags: product.tags?.join(", ") || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock),
      sellerId: currentUser.id,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
    };
    if (editingId) {
      updateProduct(editingId, productData);
    } else {
      addProduct(productData);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditingId(null); }, 1200);
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="seller-page">
      <div className="container">
        <div className="seller-header">
          <div>
            <h1 className="page-title">Manage Products</h1>
            <p className="page-subtitle">{products.length} products listed</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={(e) => e.target.classList.contains("modal-overlay") && setShowForm(false)}>
            <div className="modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="form-input" placeholder="Enter product name" />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="form-input">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Selling Price (Rs.) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="form-input" min="0" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Original Price (Rs.)</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="form-input" min="0" placeholder="0 (optional)" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required className="form-input" min="0" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="form-input" placeholder="e.g. wireless, premium, gift" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URL *</label>
                  <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required className="form-input" placeholder="https://images.unsplash.com/..." />
                  {form.image && (
                    <div className="image-preview">
                      <img src={form.image} alt="preview" onError={(e) => (e.target.style.display = "none")} />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="form-input form-textarea" rows="3" placeholder="Detailed product description..." />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className={`btn-primary ${saved ? "saved" : ""}`}>
                    {saved ? "✓ Saved!" : editingId ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="empty-state">
            <span>📦</span>
            <h3>No products yet</h3>
            <p>Add your first product to start selling</p>
            <button className="btn-primary" onClick={openAdd}>+ Add Product</button>
          </div>
        ) : (
          <div className="manage-products-grid">
            {products.map((product) => (
              <div key={product.id} className="manage-product-card">
                <div className="manage-product-image">
                  <img src={product.image} alt={product.name} />
                  <div className="manage-product-overlay">
                    <button className="edit-btn" onClick={() => openEdit(product)}>✏️ Edit</button>
                    <button className="delete-btn-card" onClick={() => setDeleteConfirm(product.id)}>🗑 Delete</button>
                  </div>
                </div>
                <div className="manage-product-info">
                  <div className="manage-product-category">{product.category}</div>
                  <h4 className="manage-product-name">{product.name}</h4>
                  <div className="manage-product-meta">
                    <span className="manage-price">Rs. {product.price.toLocaleString()}</span>
                    <span className={`stock-indicator ${product.stock <= 5 ? "low" : ""} ${product.stock === 0 ? "zero" : ""}`}>
                      {product.stock === 0 ? "Out of Stock" : `${product.stock} in stock`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="modal-overlay">
            <div className="modal modal-sm">
              <h3>Delete Product?</h3>
              <p>This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
