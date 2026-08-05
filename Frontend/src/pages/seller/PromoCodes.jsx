import { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { useAuth } from "../../context/AuthContext";

const EMPTY_FORM = {
  code: "",
  discount: "",
  type: "percentage",
  minOrderAmount: "",
  maxUses: "",
  expiryDate: "",
  description: "",
  active: true,
};

export default function PromoCodes() {
  const { currentUser } = useAuth();
  const { getPromosBySeller, addPromoCode, updatePromoCode, deletePromoCode } = useStore();
  const promos = getPromosBySeller(currentUser?.id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [codeError, setCodeError] = useState("");

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm({ ...form, code });
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setCodeError("");
    setShowForm(true);
  };

  const openEdit = (promo) => {
    setForm({
      code: promo.code,
      discount: promo.discount,
      type: promo.type,
      minOrderAmount: promo.minOrderAmount,
      maxUses: promo.maxUses,
      expiryDate: promo.expiryDate,
      description: promo.description,
      active: promo.active,
    });
    setEditingId(promo.id);
    setCodeError("");
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCodeError("");

    // Check for duplicate code
    if (!editingId) {
      const duplicate = promos.find((p) => p.code.toUpperCase() === form.code.toUpperCase());
      if (duplicate) {
        setCodeError("This promo code already exists.");
        return;
      }
    }

    const promoData = {
      ...form,
      code: form.code.toUpperCase(),
      discount: Number(form.discount),
      minOrderAmount: Number(form.minOrderAmount),
      maxUses: Number(form.maxUses),
      sellerId: currentUser.id,
    };

    if (editingId) {
      updatePromoCode(editingId, promoData);
    } else {
      addPromoCode(promoData);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditingId(null); }, 1200);
  };

  const toggleActive = (promo) => {
    updatePromoCode(promo.id, { active: !promo.active });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
  <div className="max-w-7xl mx-auto px-4">

    {/* Header */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Promo Codes
        </h1>

        <p className="mt-2 text-gray-500">
          {promos.length} {promos.length === 1 ? "code" : "codes"} created
        </p>
      </div>

      <button
        onClick={openAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow hover:bg-violet-700 transition"
      >
        <span className="text-lg">+</span>
        Create Promo Code
      </button>

    </div>

        {/* Promo Form Modal */}
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
          {editingId ? "Edit Promo Code" : "Create Promo Code"}
        </h3>

        <button
          onClick={() => setShowForm(false)}
          className="text-2xl text-gray-500 hover:text-red-500 transition"
        >
          ✕
        </button>
      </div>

      {/* Form */}
     <form
  onSubmit={handleSubmit}
  className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[80vh] sm:max-h-[85vh]"
>
        {/* Promo Code */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Promo Code *
          </label>

         <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={form.code}
              onChange={(e) => {
                setForm({
                  ...form,
                  code: e.target.value.toUpperCase(),
                });
                setCodeError("");
              }}
              required
              disabled={!!editingId}
              maxLength={16}
              placeholder="SAVE20"
              className={`flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 ${
                codeError
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {!editingId && (
              <button
                type="button"
                onClick={generateCode}
                className="rounded-xl bg-gray-100 px-5 font-medium hover:bg-gray-200 transition"
              >
                🎲 Generate
              </button>
            )}
          </div>

          {codeError && (
            <p className="mt-2 text-sm text-red-600">
              {codeError}
            </p>
          )}
        </div>

        {/* Type + Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Discount Type
            </label>

            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="percentage">
                Percentage (%)
              </option>

              <option value="fixed">
                Fixed Amount (Rs.)
              </option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Discount Value
            </label>

            <input
              type="number"
              value={form.discount}
              onChange={(e) =>
                setForm({
                  ...form,
                  discount: e.target.value,
                })
              }
              required
              min="1"
              max={
                form.type === "percentage"
                  ? "100"
                  : undefined
              }
              placeholder={
                form.type === "percentage"
                  ? "20"
                  : "500"
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

        </div>

        {/* Min Order + Max Uses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Min. Order (Rs.)
            </label>

            <input
              type="number"
              value={form.minOrderAmount}
              onChange={(e) =>
                setForm({
                  ...form,
                  minOrderAmount:
                    e.target.value,
                })
              }
              required
              min="0"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Max Uses
            </label>

            <input
              type="number"
              value={form.maxUses}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxUses: e.target.value,
                })
              }
              required
              min="1"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

        </div>

        {/* Expiry + Active */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Expiry Date
            </label>

            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  expiryDate:
                    e.target.value,
                })
              }
              required
              min={today}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Status
            </label>

            <label className="flex items-center gap-3 mt-3 cursor-pointer">

              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    active:
                      e.target.checked,
                  })
                }
                className="h-5 w-5 accent-violet-600"
              />

              <span
                className={`font-medium ${
                  form.active
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {form.active
                  ? "Active"
                  : "Inactive"}
              </span>

            </label>
          </div>

        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Description
          </label>

          <input
            type="text"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
            placeholder="Brief description..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
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
              ? "Update Code"
              : "Create Code"}
          </button>

        </div>

      </form>
    </div>
  </div>
)}

        {/* Promo Cards */}
{promos.length === 0 ? (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-16 text-center">
    <div className="text-6xl mb-4">🏷️</div>

    <h3 className="text-2xl font-bold text-gray-800">
      No promo codes yet
    </h3>

    <p className="text-gray-500 mt-2 mb-6">
      Create your first promo code to attract customers
    </p>

    <button
      onClick={openAdd}
      className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-medium transition"
    >
      + Create Promo Code
    </button>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {promos.map((promo) => {
      const usagePercent = Math.min(
        100,
        (promo.usedCount / promo.maxUses) * 100
      );

      const isExpired = new Date(promo.expiryDate) < new Date();

      return (
        <div
          key={promo.id}
          className={`rounded-2xl border p-6 shadow-sm transition hover:shadow-lg ${
            !promo.active || isExpired
              ? "bg-gray-100 border-gray-200 opacity-80"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <h3 className="text-xl font-bold text-violet-600 tracking-wide">
                {promo.code}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {promo.type === "percentage"
                  ? `${promo.discount}% OFF`
                  : `Rs. ${promo.discount} OFF`}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEdit(promo)}
                className="w-9 h-9 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center"
              >
                ✏️
              </button>

              <button
                onClick={() => setDeleteConfirm(promo.id)}
                className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-5">
            <div>
              <p className="text-gray-500">Min. Order</p>
              <p className="font-semibold">
                Rs. {promo.minOrderAmount?.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Uses</p>
              <p className="font-semibold">
                {promo.usedCount}/{promo.maxUses}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Expires</p>
              <p
                className={`font-semibold ${
                  isExpired ? "text-red-500" : "text-gray-700"
                }`}
              >
                {new Date(promo.expiryDate).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>

              <button
                onClick={() => !isExpired && toggleActive(promo)}
                disabled={isExpired}
                className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  isExpired
                    ? "bg-red-100 text-red-600"
                    : promo.active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isExpired
                  ? "Expired"
                  : promo.active
                  ? "Active"
                  : "Inactive"}
              </button>
            </div>
          </div>

          {/* Usage */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Usage</span>
              <span>{Math.round(usagePercent)}%</span>
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          {/* Description */}
          {promo.description && (
            <p className="text-sm text-gray-500 border-t pt-4">
              {promo.description}
            </p>
          )}
        </div>
      );
    })}
  </div>
)}

{/* Delete Confirmation */}
{deleteConfirm && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
      <h3 className="text-xl font-bold text-gray-800">
        Delete Promo Code?
      </h3>

      <p className="text-gray-500 mt-2 mb-6">
        This will permanently remove the promo code.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => setDeleteConfirm(null)}
          className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            deletePromoCode(deleteConfirm);
            setDeleteConfirm(null);
          }}
          className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition"
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
