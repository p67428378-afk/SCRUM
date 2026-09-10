import React, { useState } from "react";
import ModalDialog from "../common/ModalDialog";

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  item,
  onSubmit,
}) {
  const [adjustmentType, setAdjustmentType] = useState("use"); // 'add' or 'use'
  const [quantityValue, setQuantityValue] = useState("");
  const [reasonNotes, setReasonNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const qty = Number(quantityValue);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid positive adjustment quantity.");
      return;
    }

    const currentQty = item?.quantity || 0;
    const delta = adjustmentType === "use" ? -qty : qty;
    const resultingQty = currentQty + delta;

    // Strict Business Rule check: Negative inventory quantities are strictly rejected.
    if (resultingQty < 0) {
      setError(
        `Business Rule Enforced: Resulting inventory quantity cannot be negative (${currentQty} - ${qty} = ${resultingQty} ${item?.unit || ""}). Negative stock is strictly rejected.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(item?.id || "inv-301", {
        quantity_delta: delta,
        reason_notes: reasonNotes.trim(),
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to adjust inventory stock.",
      );
    }
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${item?.item_name || "Item"}`}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
          <p className="text-slate-600 font-medium">
            Current Stock Level:{" "}
            <span className="font-bold text-slate-800">
              {item?.quantity} {item?.unit}
            </span>{" "}
            (Threshold: {item?.reorder_threshold} {item?.unit})
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Adjustment Direction *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center p-2.5 rounded-md border text-xs font-bold cursor-pointer transition-colors ${
                adjustmentType === "use"
                  ? "bg-rose-50 border-rose-300 text-rose-800"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <input
                type="radio"
                name="adjType"
                value="use"
                checked={adjustmentType === "use"}
                onChange={() => setAdjustmentType("use")}
                className="sr-only"
              />
              <span>- Log Usage / Consumption</span>
            </label>

            <label
              className={`flex items-center justify-center p-2.5 rounded-md border text-xs font-bold cursor-pointer transition-colors ${
                adjustmentType === "add"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <input
                type="radio"
                name="adjType"
                value="add"
                checked={adjustmentType === "add"}
                onChange={() => setAdjustmentType("add")}
                className="sr-only"
              />
              <span>+ Add Received Stock</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quantity ({item?.unit}) *
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 50"
            value={quantityValue}
            onChange={(e) => setQuantityValue(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason / Notes *
          </label>
          <textarea
            value={reasonNotes}
            onChange={(e) => setReasonNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Applied 50kg NPK on Field A1; or Received new shipment from supplier Invoice #9910."
            className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            required
          />
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-emerald-800 text-white rounded-md text-xs font-bold hover:bg-emerald-900 disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Confirm Stock Adjustment"}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
}
