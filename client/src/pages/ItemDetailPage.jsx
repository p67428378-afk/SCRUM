import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { itemService, inventoryService } from "../services/api";
import Navbar from "../components/layout/Navbar";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [adjustmentType, setAdjustmentType] = useState("Restock");
  const [quantityChanged, setQuantityChanged] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [itemData, adjData] = await Promise.all([
        itemService.getItem(id),
        itemService.getItemAdjustments(id),
      ]);
      setItem(itemData);
      setAdjustments(adjData);
    } catch (err) {
      setError("Failed to load item details. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const qty = parseFloat(quantityChanged);
    if (isNaN(qty)) {
      setFormError("Please enter a valid quantity.");
      setSubmitting(false);
      return;
    }

    if (qty === 0) {
      setFormError("Adjustment quantity must not be 0.");
      setSubmitting(false);
      return;
    }

    if (!reason.trim()) {
      setFormError("Please provide a reason for the adjustment.");
      setSubmitting(false);
      return;
    }

    try {
      await inventoryService.adjustStock(id, {
        adjustment_type: adjustmentType,
        quantity_changed: qty,
        reason: reason.trim(),
      });
      // Reset form
      setQuantityChanged("");
      setReason("");
      // Refresh data
      await fetchData();
    } catch (err) {
      setFormError(
        err.response?.data?.detail || "Failed to submit adjustment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fafc] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#707a8c]">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#f7fafc] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-[#db2626] font-medium">
            {error || "Item not found."}
          </p>
          <Link
            to="/"
            className="text-[#2663eb] hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStock = parseFloat(item.inventory?.current_stock || 0);
  const reorderThreshold = parseFloat(item.inventory?.reorder_threshold || 0);
  const isLow = currentStock <= reorderThreshold;

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col">
      <Navbar />

      <div className="flex-1 p-[32px] flex flex-col gap-[24px] max-w-[1400px] mx-auto w-full">
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <div className="text-[#707a8c] text-[12px] font-medium">
            <Link to="/" className="hover:text-[#2663eb]">
              Dashboard
            </Link>
            {" › "}
            <span className="text-[#171c29]">{item.category}</span>
            {" › "}
            <span className="text-[#171c29] font-semibold">
              {item.name} ({item.sku})
            </span>
          </div>
          <Link
            to="/"
            className="text-[#707a8c] hover:text-[#171c29] flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
          {/* Left Column - Details & Adjustment Form */}
          <div className="lg:col-span-7 flex flex-col gap-[24px]">
            {/* Product Details */}
            <div className="bg-white border border-[#e3e8f0] p-[24px] rounded-[14px] shadow-sm flex flex-col gap-[16px]">
              <h3 className="font-bold text-[#171c29] text-[18px]">
                Product Details
              </h3>
              <div className="flex flex-col gap-[12px]">
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                  <span className="text-[#707a8c]">SKU</span>
                  <span className="font-mono font-semibold text-[#171c29]">
                    {item.sku}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                  <span className="text-[#707a8c]">Name</span>
                  <span className="font-medium text-[#171c29]">
                    {item.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                  <span className="text-[#707a8c]">Category</span>
                  <span className="font-medium text-[#171c29]">
                    {item.category}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                  <span className="text-[#707a8c]">Unit Price</span>
                  <span className="font-semibold text-[#171c29]">
                    ${parseFloat(item.unit_price).toFixed(2)} /{" "}
                    {item.unit_of_measure}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                  <span className="text-[#707a8c]">Cost Price</span>
                  <span className="font-semibold text-[#171c29]">
                    ${parseFloat(item.cost_price).toFixed(2)} /{" "}
                    {item.unit_of_measure}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                  <span className="text-[#707a8c]">Unit of Measure</span>
                  <span className="font-medium text-[#171c29]">
                    {item.unit_of_measure}
                  </span>
                </div>
                <div className="flex justify-between pb-2 text-sm">
                  <span className="text-[#707a8c]">Supplier</span>
                  <span className="font-medium text-[#171c29]">
                    {item.supplier_name}
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Stock Adjustment Form */}
            <div className="bg-white border border-[#e3e8f0] p-[24px] rounded-[14px] shadow-sm flex flex-col gap-[16px]">
              <h3 className="font-bold text-[#171c29] text-[18px]">
                Manual Stock Adjustment
              </h3>
              <p className="text-[#707a8c] text-[13px]">
                Perform a manual stock adjustment. This action will be logged in
                the audit trail.
              </p>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-[#db2626] p-[12px] rounded-[10px] text-sm">
                  {formError}
                </div>
              )}

              <form
                onSubmit={handleAdjustmentSubmit}
                className="flex flex-col gap-[16px]"
              >
                <div className="flex flex-col gap-[4px]">
                  <label className="text-[#707a8c] text-[12px] font-medium">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none font-medium text-[#171c29]"
                  >
                    <option value="Restock">Restock (Positive)</option>
                    <option value="Damage">Damage (Negative)</option>
                    <option value="Correction">
                      Correction (Positive/Negative)
                    </option>
                  </select>
                </div>

                <div className="flex flex-col gap-[4px]">
                  <label className="text-[#707a8c] text-[12px] font-medium">
                    Quantity Changed
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={quantityChanged}
                    onChange={(e) => setQuantityChanged(e.target.value)}
                    placeholder="e.g., -5.000 or 10.000"
                    className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-[4px]">
                  <label className="text-[#707a8c] text-[12px] font-medium">
                    Reason for Adjustment
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Spoiled apples removed from display"
                    className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Submitting..." : "Submit Adjustment"}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column - Stock Status & Audit Log */}
          <div className="lg:col-span-5 flex flex-col gap-[24px]">
            {/* Current Stock Status */}
            <div className="bg-white border border-[#e3e8f0] p-[24px] rounded-[14px] shadow-sm flex flex-col gap-[16px]">
              <h3 className="font-bold text-[#171c29] text-[18px]">
                Current Stock Status
              </h3>
              <div className="bg-white border border-[#e3e8f0] p-[16px] rounded-[14px] shadow-sm flex flex-col gap-[4px]">
                <p className="text-[#707a8c] text-[12px] font-medium">
                  Current Stock
                </p>
                <div className="flex gap-[8px] items-baseline">
                  <p className="font-bold text-[#171c29] text-[24px]">
                    {currentStock.toFixed(3)} {item.unit_of_measure}
                  </p>
                  {isLow ? (
                    <Badge variant="danger">⚠️ Low Stock</Badge>
                  ) : (
                    <Badge variant="success">✓ In Stock</Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <span className="text-[#707a8c]">Reorder Threshold</span>
                <span className="font-semibold text-[#171c29]">
                  {reorderThreshold.toFixed(3)} {item.unit_of_measure}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#707a8c]">Status</span>
                <span
                  className={`font-semibold ${isLow ? "text-[#db2626]" : "text-[#17a34a]"}`}
                >
                  {isLow
                    ? "Below Threshold (Needs Restock)"
                    : "Healthy Stock Level"}
                </span>
              </div>
            </div>

            {/* Stock Adjustment Audit Log */}
            <div className="bg-white border border-[#e3e8f0] p-[24px] rounded-[14px] shadow-sm flex flex-col gap-[16px]">
              <h3 className="font-bold text-[#171c29] text-[18px]">
                Stock Adjustment Audit Log
              </h3>
              <div className="flex flex-col gap-[12px] max-h-[400px] overflow-y-auto">
                {adjustments.length === 0 ? (
                  <p className="text-[#707a8c] text-sm text-center py-4">
                    No adjustments logged yet.
                  </p>
                ) : (
                  adjustments.map((adj) => (
                    <div
                      key={adj.id}
                      className="border-b border-gray-100 pb-3 last:border-none"
                    >
                      <div className="flex justify-between text-xs text-[#707a8c] mb-1">
                        <span>{new Date(adj.created_at).toLocaleString()}</span>
                        <span className="font-medium">
                          {adj.user_email} ({adj.user_role})
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-[#171c29]">
                          {adj.adjustment_type}
                        </span>
                        <span
                          className={`font-mono font-bold ${adj.quantity_changed > 0 ? "text-[#17a34a]" : "text-[#db2626]"}`}
                        >
                          {adj.quantity_changed > 0 ? "+" : ""}
                          {adj.quantity_changed.toFixed(3)}{" "}
                          {item.unit_of_measure}
                        </span>
                      </div>
                      <p className="text-xs text-[#707a8c] mt-1 italic">
                        "{adj.reason}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
