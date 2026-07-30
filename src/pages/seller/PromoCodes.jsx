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
    <div className="seller-page">
      <div className="container">
        <div className="seller-header">
          <div>
            <h1 className="page-title">Promo Codes</h1>
            <p className="page-subtitle">{promos.length} codes created</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>+ Create Promo Code</button>
        </div>

        {/* Promo Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={(e) => e.target.classList.contains("modal-overlay") && setShowForm(false)}>
            <div className="modal">
              <div className="modal-header">
                <h3>{editingId ? "Edit Promo Code" : "Create Promo Code"}</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Promo Code *</label>
                  <div className="code-input-row">
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => { setForm({ ...form, code: e.target.value.toUpperCase() }); setCodeError(""); }}
                      required
                      className={`form-input ${codeError ? "input-error" : ""}`}
                      placeholder="e.g. SAVE20"
                      maxLength={16}
                      disabled={!!editingId}
                    />
                    {!editingId && (
                      <button type="button" className="generate-btn" onClick={generateCode}>
                        🎲 Generate
                      </button>
                    )}
                  </div>
                  {codeError && <div className="field-error">{codeError}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Type *</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="form-input">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Value *</label>
                    <input
                      type="number"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      required
                      className="form-input"
                      min="1"
                      max={form.type === "percentage" ? "100" : undefined}
                      placeholder={form.type === "percentage" ? "e.g. 20 (%)" : "e.g. 500 (Rs.)"}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Min. Order Amount (Rs.) *</label>
                    <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} required className="form-input" min="0" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Max Uses *</label>
                    <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} required className="form-input" min="1" placeholder="100" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required className="form-input" min={today} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <div className="toggle-wrap">
                      <label className="toggle-label">
                        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="toggle-input" />
                        <span className="toggle-slider" />
                        <span className="toggle-text">{form.active ? "Active" : "Inactive"}</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input" placeholder="Brief description of this promo..." />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className={`btn-primary ${saved ? "saved" : ""}`}>
                    {saved ? "✓ Saved!" : editingId ? "Update Code" : "Create Code"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Promo Cards */}
        {promos.length === 0 ? (
          <div className="empty-state">
            <span>🏷️</span>
            <h3>No promo codes yet</h3>
            <p>Create your first promo code to attract customers</p>
            <button className="btn-primary" onClick={openAdd}>+ Create Promo Code</button>
          </div>
        ) : (
          <div className="promos-grid">
            {promos.map((promo) => {
              const usagePercent = Math.min(100, (promo.usedCount / promo.maxUses) * 100);
              const isExpired = new Date(promo.expiryDate) < new Date();
              return (
                <div key={promo.id} className={`promo-card-seller ${!promo.active || isExpired ? "inactive" : ""}`}>
                  <div className="promo-card-header">
                    <div className="promo-code-big">{promo.code}</div>
                    <div className="promo-card-actions">
                      <button className="icon-btn edit" onClick={() => openEdit(promo)} title="Edit">✏️</button>
                      <button className="icon-btn delete" onClick={() => setDeleteConfirm(promo.id)} title="Delete">🗑</button>
                    </div>
                  </div>
                  <div className="promo-discount-display">
                    {promo.type === "percentage" ? `${promo.discount}% OFF` : `Rs. ${promo.discount} OFF`}
                  </div>
                  <div className="promo-meta-grid">
                    <div className="promo-meta-item">
                      <span className="meta-label">Min. Order</span>
                      <span className="meta-value">Rs. {promo.minOrderAmount?.toLocaleString()}</span>
                    </div>
                    <div className="promo-meta-item">
                      <span className="meta-label">Uses</span>
                      <span className="meta-value">{promo.usedCount}/{promo.maxUses}</span>
                    </div>
                    <div className="promo-meta-item">
                      <span className="meta-label">Expires</span>
                      <span className={`meta-value ${isExpired ? "expired-text" : ""}`}>
                        {new Date(promo.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="promo-meta-item">
                      <span className="meta-label">Status</span>
                      <label className="toggle-label-sm">
                        <input type="checkbox" checked={promo.active && !isExpired} onChange={() => toggleActive(promo)} className="toggle-input" disabled={isExpired} />
                        <span className="toggle-slider-sm" />
                        <span className={`meta-value ${promo.active && !isExpired ? "active-text" : "inactive-text"}`}>
                          {isExpired ? "Expired" : promo.active ? "Active" : "Inactive"}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="usage-bar-wrap">
                    <div className="usage-bar-label">
                      <span>Usage</span>
                      <span>{Math.round(usagePercent)}%</span>
                    </div>
                    <div className="usage-bar-bg">
                      <div className="usage-bar-fill" style={{ width: `${usagePercent}%` }} />
                    </div>
                  </div>
                  {promo.description && <p className="promo-description">{promo.description}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="modal-overlay">
            <div className="modal modal-sm">
              <h3>Delete Promo Code?</h3>
              <p>This will permanently remove the promo code.</p>
              <div className="modal-actions">
                <button className="btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn-danger" onClick={() => { deletePromoCode(deleteConfirm); setDeleteConfirm(null); }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
