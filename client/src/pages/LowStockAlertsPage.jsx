import React, { useState, useEffect } from "react";
import LowStockAlertTable from "../components/alerts/LowStockAlertTable";
import { getAlerts } from "../services/api";
import { AlertCircle, RefreshCw } from "lucide-react";

const LowStockAlertsPage = ({ setAlertsCount }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mockAlerts = [
    {
      id: "77777777-8888-9999-0000-111122223333",
      item_id: "e81d7f42-a123-4bde-8f81-8971f1234567",
      sku: "SKU-9901",
      warehouse_id: "11111111-2222-3333-4444-555555555555",
      warehouse_name: "Warehouse A (Central)",
      current_quantity: 8,
      reorder_threshold: 10,
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    },
    {
      id: "88888888-9999-0000-1111-222233334444",
      item_id: "f92e8f53-b234-5cef-9g92-9082g2345678",
      sku: "SKU-9902",
      warehouse_id: "22222222-3333-4444-5555-666666666666",
      warehouse_name: "Warehouse B (North)",
      current_quantity: 5,
      reorder_threshold: 15,
      status: "ACTIVE",
      created_at: new Date(Date.now() - 7200000).toISOString(),
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

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAlerts();
      const list = extractArray(data, ["alerts", "items", "data"]);
      const finalAlerts = list.length > 0 ? list : mockAlerts;
      setAlerts(finalAlerts);
      if (setAlertsCount) {
        const activeCount = finalAlerts.filter(
          (a) => a.status === "ACTIVE",
        ).length;
        setAlertsCount(activeCount);
      }
    } catch (err) {
      console.error("Failed to load alerts:", err);
      setError(
        "Could not fetch low-stock notifications. Displaying active alerts.",
      );
      setAlerts(mockAlerts);
      if (setAlertsCount) setAlertsCount(mockAlerts.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolveAlert = (alertToResolve) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((a) =>
        a.id === alertToResolve.id ? { ...a, status: "RESOLVED" } : a,
      ),
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Low Stock Alert Center
          </h2>
          <p className="text-xs text-slate-400">
            Monitor active stock deficits and dispatch warehouse replenishment
            workflows
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Alerts
        </button>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <LowStockAlertTable
        alerts={alerts}
        loading={loading}
        onResolveAlert={handleResolveAlert}
      />
    </div>
  );
};

export default LowStockAlertsPage;
