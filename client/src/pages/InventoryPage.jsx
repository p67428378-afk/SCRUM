import React, { useState, useEffect } from "react";
import { Plus, Package, AlertTriangle, DollarSign, Layers } from "lucide-react";
import TeaInventoryTable from "../components/inventory/TeaInventoryTable";
import ReorderAlertBanner from "../components/inventory/ReorderAlertBanner";
import AddTeaModal from "../components/inventory/AddTeaModal";
import {
  getTeas,
  createTea,
  adjustInventory,
  getInventoryAlerts,
} from "../services/api";

export default function InventoryPage() {
  const [teas, setTeas] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockDefaultTeas = [
    {
      id: "1",
      name: "Dragonwell Green Tea",
      category: "Green Tea",
      current_stock_grams: 350,
      min_threshold_grams: 500,
      unit_price: 18.5,
      supplier_name: "Hangzhou Organic Teas",
    },
    {
      id: "2",
      name: "Jasmine Pearls",
      category: "Green Tea",
      current_stock_grams: 1200,
      min_threshold_grams: 500,
      unit_price: 22.0,
      supplier_name: "Fujian Herbal Co.",
    },
    {
      id: "3",
      name: "Traditional Earl Grey",
      category: "Black Tea",
      current_stock_grams: 2400,
      min_threshold_grams: 600,
      unit_price: 14.0,
      supplier_name: "Ceylon Export Ltd.",
    },
    {
      id: "4",
      name: "Ti Kuan Yin Oolong",
      category: "Oolong",
      current_stock_grams: 420,
      min_threshold_grams: 500,
      unit_price: 26.0,
      supplier_name: "Anxi Oolong House",
    },
    {
      id: "5",
      name: "Chamomile Blossom",
      category: "Herbal",
      current_stock_grams: 3100,
      min_threshold_grams: 400,
      unit_price: 12.5,
      supplier_name: "Alpine Herbs USA",
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const teasData = await getTeas();
      if (Array.isArray(teasData) && teasData.length > 0) {
        setTeas(teasData);
      } else {
        setTeas(mockDefaultTeas);
      }

      try {
        const alertsData = await getInventoryAlerts();
        if (Array.isArray(alertsData)) {
          setAlerts(alertsData);
        } else {
          setAlerts(
            mockDefaultTeas.filter(
              (t) => t.current_stock_grams < t.min_threshold_grams,
            ),
          );
        }
      } catch {
        setAlerts(
          mockDefaultTeas.filter(
            (t) => t.current_stock_grams < t.min_threshold_grams,
          ),
        );
      }
    } catch {
      // Fallback to initial mock state if backend is offline/loading
      setTeas(mockDefaultTeas);
      setAlerts(
        mockDefaultTeas.filter(
          (t) => t.current_stock_grams < t.min_threshold_grams,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTeaAdded = async (teaData) => {
    try {
      await createTea(teaData);
    } catch {
      // Local fallback for offline mode
      const newEntry = { ...teaData, id: String(Date.now()) };
      setTeas((prev) => [...prev, newEntry]);
    }
    fetchData();
  };

  const handleStockAdjusted = async (adjustmentData) => {
    try {
      await adjustInventory(adjustmentData);
    } catch {
      // Local fallback
      setTeas((prev) =>
        prev.map((t) =>
          t.id === adjustmentData.tea_id
            ? {
                ...t,
                current_stock_grams: Math.max(
                  0,
                  t.current_stock_grams + Number(adjustmentData.change_grams),
                ),
              }
            : t,
        ),
      );
    }
    fetchData();
  };

  const totalStockGrams = teas.reduce(
    (sum, t) => sum + (t.current_stock_grams || 0),
    0,
  );
  const criticalCount = teas.filter(
    (t) => (t.current_stock_grams || 0) < (t.min_threshold_grams || 500),
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Tea Inventory & Stock Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor tea stock volumes, supplier details, and threshold alerts in
            real-time.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-800 text-white font-bold text-sm rounded-xl hover:bg-emerald-900 transition flex items-center justify-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tea / Adjust Stock</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-700">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Varieties
            </p>
            <p className="text-xl font-extrabold text-gray-900">
              {teas.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-700">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Stock Volume
            </p>
            <p className="text-xl font-extrabold text-gray-900">
              {totalStockGrams.toLocaleString()}g
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-700">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Reorder Alerts
            </p>
            <p className="text-xl font-extrabold text-red-600">
              {criticalCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estimated Value
            </p>
            <p className="text-xl font-extrabold text-gray-900">
              $
              {(totalStockGrams * 0.18).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      <ReorderAlertBanner
        alertTeas={alerts}
        onRestockClick={() => setIsModalOpen(true)}
      />

      {/* Main Inventory Catalog Table */}
      <TeaInventoryTable
        teas={teas}
        onOpenModal={() => setIsModalOpen(true)}
        onRestockQuick={() => setIsModalOpen(true)}
      />

      {/* Add / Adjust Stock Modal */}
      <AddTeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTeaAdded={handleTeaAdded}
        onStockAdjusted={handleStockAdjusted}
        teas={teas}
      />
    </div>
  );
}
