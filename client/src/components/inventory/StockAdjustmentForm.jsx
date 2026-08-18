import React, { useState } from "react";
import { adjustIngredientStock } from "../../services/api";
import { PackagePlus, AlertCircle } from "lucide-react";

export default function StockAdjustmentForm({
  ingredient,
  onClose,
  onSuccess,
}) {
  const [quantityChange, setQuantityChange] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("add"); // 'add' or 'subtract'
  const [reason, setReason] = useState("Supplier Restock");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantityChange || parseFloat(quantityChange) <= 0) {
      setError("Please enter a valid quantity amount greater than 0.");
      return;
    }

    const val = parseFloat(quantityChange);
    const delta = adjustmentType === "subtract" ? -val : val;

    setSubmitting(true);
    setError(null);
    try {
      await adjustIngredientStock(ingredient.id, delta, reason);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("Error adjusting stock:", err);
      setError(
        err.response?.data?.detail || "Failed to adjust ingredient stock.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!ingredient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E5DED1] overflow-hidden">
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E5DED1] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PackagePlus className="w-5 h-5 text-[#D96B1F]" />
            <h3 className="font-bold text-[#1F1A14]">
              Adjust Stock: {ingredient.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#80756B] hover:text-[#1F1A14]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#D92D2D] rounded-md text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-[#FAF7F2] p-3 rounded-md border border-[#E5DED1] text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#80756B]">Current Level:</span>
              <span className="font-bold text-[#1F1A14]">
                {ingredient.stock_quantity} {ingredient.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#80756B]">Reorder Threshold:</span>
              <span className="font-medium text-[#1F1A14]">
                {ingredient.reorder_threshold} {ingredient.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1F1A14] mb-1">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType("add")}
                className={`py-2 text-xs font-medium rounded-md border transition-colors ${
                  adjustmentType === "add"
                    ? "bg-emerald-50 text-[#1F9E4D] border-emerald-300 font-bold"
                    : "bg-white text-[#80756B] border-[#E5DED1]"
                }`}
              >
                + Restock / Add
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("subtract")}
                className={`py-2 text-xs font-medium rounded-md border transition-colors ${
                  adjustmentType === "subtract"
                    ? "bg-red-50 text-[#D92D2D] border-red-300 font-bold"
                    : "bg-white text-[#80756B] border-[#E5DED1]"
                }`}
              >
                - Reduce / Spoilage
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1F1A14] mb-1">
              Quantity Amount ({ingredient.unit})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 25.0"
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              className="w-full text-xs p-2 border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1F1A14] mb-1">
              Reason / Note
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2 border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
            >
              <option value="Supplier Restock">
                Supplier Restock / Delivery
              </option>
              <option value="Manual Inventory Audit">
                Manual Inventory Audit
              </option>
              <option value="Spoilage / Waste">
                Spoilage / Waste Deduction
              </option>
              <option value="Correction">Correction</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E5DED1] text-xs font-medium text-[#1F1A14] rounded-md hover:bg-[#FAF7F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#D96B1F] text-white text-xs font-medium rounded-md hover:bg-[#B85310]"
            >
              {submitting ? "Applying..." : "Apply Stock Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
