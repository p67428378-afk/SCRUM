import React, { useState } from "react";
import { X, PlusCircle, RefreshCw } from "lucide-react";

export default function AddTeaModal({
  isOpen,
  onClose,
  onTeaAdded,
  onStockAdjusted,
  teas = [],
}) {
  const [activeTab, setActiveTab] = useState("add_tea"); // 'add_tea' or 'adjust_stock'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New Tea form state
  const [newTea, setNewTea] = useState({
    name: "",
    category: "Green Tea",
    current_stock_grams: 1000,
    min_threshold_grams: 500,
    unit_price: 15.0,
    supplier_name: "",
  });

  // Adjust Stock form state
  const [adjustment, setAdjustment] = useState({
    tea_id: teas[0]?.id || "",
    change_grams: 500,
    reason: "RESTOCK",
  });

  if (!isOpen) return null;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onTeaAdded({
        ...newTea,
        current_stock_grams: Number(newTea.current_stock_grams),
        min_threshold_grams: Number(newTea.min_threshold_grams),
        unit_price: Number(newTea.unit_price),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add new tea variety.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustment.tea_id && teas.length > 0) {
      adjustment.tea_id = teas[0].id;
    }
    if (!adjustment.tea_id) {
      setError("Please select a tea to adjust stock.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onStockAdjusted({
        tea_id: adjustment.tea_id,
        change_grams: Number(adjustment.change_grams),
        reason: adjustment.reason,
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to adjust inventory stock.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white">
          <h2 className="text-lg font-bold">Inventory Management</h2>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab("add_tea")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === "add_tea"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Tea</span>
          </button>
          <button
            onClick={() => setActiveTab("adjust_stock")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === "adjust_stock"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Adjust Stock</span>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {activeTab === "add_tea" ? (
          <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Tea Variety Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dragonwell Green Tea"
                value={newTea.name}
                onChange={(e) => setNewTea({ ...newTea, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={newTea.category}
                  onChange={(e) =>
                    setNewTea({ ...newTea, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Green Tea">Green Tea</option>
                  <option value="Black Tea">Black Tea</option>
                  <option value="Oolong">Oolong</option>
                  <option value="Herbal">Herbal</option>
                  <option value="Milk Tea">Milk Tea</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Unit Price ($ / 100g) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newTea.unit_price}
                  onChange={(e) =>
                    setNewTea({ ...newTea, unit_price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Initial Stock (grams) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newTea.current_stock_grams}
                  onChange={(e) =>
                    setNewTea({
                      ...newTea,
                      current_stock_grams: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Reorder Threshold (g) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newTea.min_threshold_grams}
                  onChange={(e) =>
                    setNewTea({
                      ...newTea,
                      min_threshold_grams: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Supplier Name
              </label>
              <input
                type="text"
                placeholder="e.g. Hangzhou Organic Teas"
                value={newTea.supplier_name}
                onChange={(e) =>
                  setNewTea({ ...newTea, supplier_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Add Tea Variety"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Select Tea Variety *
              </label>
              <select
                value={adjustment.tea_id || teas[0]?.id || ""}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, tea_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {teas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Current: {t.current_stock_grams}g)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Change (+/- grams) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500 or -50"
                  value={adjustment.change_grams}
                  onChange={(e) =>
                    setAdjustment({
                      ...adjustment,
                      change_grams: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Positive to add stock, negative to reduce.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Adjustment Reason *
                </label>
                <select
                  value={adjustment.reason}
                  onChange={(e) =>
                    setAdjustment({ ...adjustment, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="RESTOCK">RESTOCK</option>
                  <option value="AUDIT">AUDIT</option>
                  <option value="SPOILAGE">SPOILAGE</option>
                  <option value="ORDER_DEDUCTION">ORDER DEDUCTION</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Submit Stock Adjustment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
