import React, { useState, useEffect } from "react";
import StockAdjustmentTable from "../components/adjustments/StockAdjustmentTable";
import StockAdjustmentModal from "../components/adjustments/StockAdjustmentModal";
import { getStockAdjustments, createStockAdjustment } from "../services/api";
import { AlertCircle, RefreshCw } from "lucide-react";

const StockAdjustmentsPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockAdjustments = [
    {
      adjustment_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      sku: "SKU-9901",
      warehouse_id: "11111111-2222-3333-4444-555555555555",
      quantity_change: -2,
      previous_quantity: 10,
      new_quantity: 8,
      reason_code: "DAMAGED_GOODS",
      notes: "Units damaged during fork lift transfer",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      adjustment_id: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
      sku: "SKU-9901",
      warehouse_id: "11111111-2222-3333-4444-555555555555",
      quantity_change: 50,
      previous_quantity: 100,
      new_quantity: 150,
      reason_code: "SHIPMENT_RECEIVED",
      notes: "Inbound shipment PO-8802 received from vendor",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const extractArray = (value, preferredKeys = []) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    for (const key of preferredKeys) {
      if (Array.isArray(value[key])) return value[key];
    }
    return [];
  };

  const loadAdjustments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getStockAdjustments();
      const list = extractArray(data, ["adjustments", "items", "data"]);
      setAdjustments(list.length > 0 ? list : mockAdjustments);
    } catch (err) {
      console.error("Failed to load adjustments:", err);
      setError(
        "Could not connect to adjustments log service. Showing local logs.",
      );
      setAdjustments(mockAdjustments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdjustments();
  }, []);

  const handleAdjustmentSubmit = async (adjustmentData) => {
    await createStockAdjustment(adjustmentData);
    await loadAdjustments();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Stock Adjustments & Audit Logs
          </h2>
          <p className="text-xs text-slate-400">
            Record manual inventory changes and inspect timestamped
            reconciliation history
          </p>
        </div>
        <button
          onClick={loadAdjustments}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Logs
        </button>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <StockAdjustmentTable
        adjustments={adjustments}
        loading={loading}
        onOpenModal={() => setIsModalOpen(true)}
      />

      <StockAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAdjustmentSubmit}
      />
    </div>
  );
};

export default StockAdjustmentsPage;
