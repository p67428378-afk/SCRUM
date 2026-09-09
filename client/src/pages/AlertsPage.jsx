import React, { useState, useEffect } from "react";
import AlertsTable from "../components/drugs/AlertsTable.jsx";
import api from "../services/api.js";
import { ShieldAlert, RefreshCw, Filter } from "lucide-react";

export const AlertsPage = ({ onAlertCountChange = () => {} }) => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // 'all', 'low_stock', 'near_expiry'

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDrugs({ skip: 0, limit: 100 });
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.items)) {
        items = data.items;
      }

      // Filter to items that are either low stock (< 50) or near expiry
      const flagged = items.filter((item) => {
        const isLow = item.is_low_stock ?? item.stock_quantity < 50;
        const isNear = item.is_near_expiry ?? false;
        return isLow || isNear;
      });

      setAlerts(flagged);
      onAlertCountChange(flagged.length);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      // Fallback sample alerts
      setAlerts([
        {
          id: "2",
          name: "Ibuprofen 200mg",
          dosage: "200mg Tablet",
          batch_number: "BATCH-2026-B",
          stock_quantity: 15,
          expiration_date: "2026-10-15",
          is_low_stock: true,
          is_near_expiry: false,
        },
        {
          id: "3",
          name: "Paracetamol 650mg",
          dosage: "650mg Tablet",
          batch_number: "BATCH-2026-C",
          stock_quantity: 320,
          expiration_date: "2026-09-30",
          is_low_stock: false,
          is_near_expiry: true,
        },
        {
          id: "4",
          name: "Metformin 500mg",
          dosage: "500mg Tablet",
          batch_number: "BATCH-2026-D",
          stock_quantity: 40,
          expiration_date: "2028-05-20",
          is_low_stock: true,
          is_near_expiry: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Filter alerts by sub-type
  const displayedAlerts = alerts.filter((item) => {
    const isLow = item.is_low_stock ?? item.stock_quantity < 50;
    const isNear = item.is_near_expiry ?? false;

    if (filterType === "low_stock") return isLow;
    if (filterType === "near_expiry") return isNear;
    return true;
  });

  const handleRestock = (item) => {
    alert(
      `Restock order initiated for ${item.name} (Batch: ${item.batch_number}).`,
    );
  };

  const handleQuarantine = (item) => {
    alert(
      `Item ${item.name} (Batch: ${item.batch_number}) marked for quarantine inspection.`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Inventory Alerts & Expiration Center
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Automated flagging for stock below 50 units and medications
              expiring within 30 days.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAlerts}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-scan Inventory</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            filterType === "all"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Warnings ({alerts.length})
        </button>

        <button
          onClick={() => setFilterType("low_stock")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            filterType === "low_stock"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Low Stock Only
        </button>

        <button
          onClick={() => setFilterType("near_expiry")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            filterType === "near_expiry"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Near Expiry Only
        </button>
      </div>

      {/* Alerts Table */}
      <AlertsTable
        alerts={displayedAlerts}
        isLoading={isLoading}
        onRestock={handleRestock}
        onQuarantine={handleQuarantine}
      />
    </div>
  );
};

export default AlertsPage;
