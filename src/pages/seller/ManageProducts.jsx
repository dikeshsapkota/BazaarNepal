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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-500 mt-1">{products.length} products listed</p>
          </div>
          <button
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-semibold transition" onClick={openAdd}>+ Add Product</button>
        </div>

        {/* Product Form Modal */}
{showForm && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) setShowForm(false);
    }}
  >
    <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-5">
        <h3 className="text-2xl font-bold text-gray-800">
          {editingId ? "Edit Product" : "Add New Product"}
        </h3>

        <button
          onClick={() => setShowForm(false)}
          className="text-2xl text-gray-500 hover:text-red-500 transition"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Name + Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Product Name *
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
              placeholder="Enter product name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Category *
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Selling Price (Rs.) *
            </label>

            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              required
              min="0"
              placeholder="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Original Price
            </label>

            <input
              type="number"
              value={form.originalPrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  originalPrice: e.target.value,
                })
              }
              min="0"
              placeholder="Optional"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>
        </div>

        {/* Stock + Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Stock Quantity *
            </label>

            <input
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: e.target.value })
              }
              required
              min="0"
              placeholder="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Tags
            </label>

            <input
              type="text"
              value={form.tags}
              onChange={(e) =>
                setForm({ ...form, tags: e.target.value })
              }
              placeholder="wireless, premium, gift"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Image URL *
          </label>

          <input
            type="url"
            value={form.image}
            onChange={(e) =>
              setForm({ ...form, image: e.target.value })
            }
            required
            placeholder="https://..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
          />

          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              onError={(e) => (e.target.style.display = "none")}
              className="mt-4 h-44 w-44 rounded-xl border object-cover"
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Description *
          </label>

          <textarea
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            required
            placeholder="Detailed product description..."
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className={`rounded-xl px-6 py-3 font-semibold text-white transition ${
              saved
                ? "bg-green-600"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {saved
              ? "✓ Saved!"
              : editingId
              ? "Update Product"
              : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* Products Grid */}
{products.length === 0 ? (
  <div className="bg-white rounded-3xl shadow-md p-12 text-center">
    <div className="text-6xl mb-4">📦</div>

    <h3 className="text-2xl font-bold text-gray-800 mb-2">
      No products yet
    </h3>

    <p className="text-gray-500 mb-6">
      Add your first product to start selling.
    </p>

    <button
      onClick={openAdd}
      className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition"
    >
      + Add Product
    </button>
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {products.map((product) => (
      <div
        key={product.id}
        className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
      >
        {/* Image */}
        <div className="relative group">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
            <button
              onClick={() => openEdit(product)}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => setDeleteConfirm(product.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              🗑 Delete
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            {product.category}
          </p>

          <h4 className="text-lg font-bold text-gray-800 mt-1 line-clamp-2">
            {product.name}
          </h4>

          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-bold text-violet-600">
              Rs. {product.price.toLocaleString()}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.stock === 0
                  ? "bg-red-100 text-red-600"
                  : product.stock <= 5
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {product.stock === 0
                ? "Out of Stock"
                : `${product.stock} in stock`}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

{/* Delete Confirmation */}
{deleteConfirm && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">

      <div className="text-5xl mb-4">🗑️</div>

      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Delete Product?
      </h3>

      <p className="text-gray-500 mb-6">
        This action cannot be undone.
      </p>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setDeleteConfirm(null)}
          className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={() => handleDelete(deleteConfirm)}
          className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}
      </div>
    </div>
  );
}
