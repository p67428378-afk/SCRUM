import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

const ItemEditDrawer = ({ isOpen, onClose, item, onSubmit }) => {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    unit_price: 10.0,
    reorder_threshold: 10,
    reorder_quantity: 50,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku || "",
        name: item.name || "",
        category_id: item.category_id || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        unit_price: item.unit_price || 10.0,
        reorder_threshold: item.reorder_threshold || 10,
        reorder_quantity: item.reorder_quantity || 50,
      });
    } else {
      setFormData({
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: "",
        category_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        unit_price: 19.99,
        reorder_threshold: 15,
        reorder_quantity: 50,
      });
    }
    setError("");
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.sku || !formData.name) {
      setError("SKU and Item Name are required fields.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        reorder_threshold: parseInt(formData.reorder_threshold, 10),
        reorder_quantity: parseInt(formData.reorder_quantity, 10),
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to save item to catalog.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-800 border-l border-slate-700 h-full p-6 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
            <h3 className="text-lg font-bold text-white">
              {item ? "Edit Catalog Item" : "New Catalog Item"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            id="item-drawer-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SKU
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. SKU-9901"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Item Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Industrial Widget Alpha"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_price: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reorder Threshold
                </label>
                <input
                  type="number"
                  required
                  value={formData.reorder_threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorder_threshold: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Reorder Quantity
              </label>
              <input
                type="number"
                required
                value={formData.reorder_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, reorder_quantity: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </form>
        </div>

        <div className="pt-4 border-t border-slate-700/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="item-drawer-form"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? "Saving..." : "Save Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemEditDrawer;
