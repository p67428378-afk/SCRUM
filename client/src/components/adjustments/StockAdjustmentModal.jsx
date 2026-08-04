import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

const StockAdjustmentModal = ({ isOpen, onClose, selectedItem, onSubmit }) => {
  const [formData, setFormData] = useState({
    item_id: "",
    warehouse_id: "11111111-2222-3333-4444-555555555555",
    quantity_change: -2,
    reason_code: "DAMAGED_GOODS",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setFormData((prev) => ({
        ...prev,
        item_id: selectedItem.item_id || selectedItem.id || "",
        warehouse_id:
          selectedItem.warehouse_id || "11111111-2222-3333-4444-555555555555",
      }));
    }
    setError("");
  }, [selectedItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.item_id || !formData.warehouse_id) {
      setError("Item ID and Warehouse ID are required.");
      return;
    }

    if (parseInt(formData.quantity_change, 10) === 0) {
      setError("Quantity change cannot be zero.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        quantity_change: parseInt(formData.quantity_change, 10),
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to submit stock adjustment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
          <h3 className="text-lg font-bold text-white">
            Record Stock Adjustment
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Item ID / SKU
            </label>
            <input
              type="text"
              required
              value={formData.item_id}
              onChange={(e) =>
                setFormData({ ...formData, item_id: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. e81d7f42-a123-4bde-8f81-8971f1234567"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Warehouse
            </label>
            <select
              value={formData.warehouse_id}
              onChange={(e) =>
                setFormData({ ...formData, warehouse_id: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="11111111-2222-3333-4444-555555555555">
                Warehouse A (Central)
              </option>
              <option value="22222222-3333-4444-5555-666666666666">
                Warehouse B (North)
              </option>
              <option value="33333333-4444-5555-6666-777777777777">
                Warehouse C (East)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Quantity Change (+ for addition, - for deduction)
            </label>
            <input
              type="number"
              required
              value={formData.quantity_change}
              onChange={(e) =>
                setFormData({ ...formData, quantity_change: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reason Code
            </label>
            <select
              value={formData.reason_code}
              onChange={(e) =>
                setFormData({ ...formData, reason_code: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="DAMAGED_GOODS">DAMAGED_GOODS</option>
              <option value="SHIPMENT_RECEIVED">SHIPMENT_RECEIVED</option>
              <option value="MANUAL_RECONCILIATION">
                MANUAL_RECONCILIATION
              </option>
              <option value="STOCK_TRANSFER">STOCK_TRANSFER</option>
              <option value="RETURN_TO_STOCK">RETURN_TO_STOCK</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes / Audit Memo
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="Detailed explanation for audit log..."
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? "Recording..." : "Submit Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
