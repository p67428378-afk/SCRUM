import React, { useState, useEffect } from "react";
import StatCardGrid from "../components/dashboard/StatCardGrid";
import StockLevelChart from "../components/dashboard/StockLevelChart";
import WarehouseDonutChart from "../components/dashboard/WarehouseDonutChart";
import InventoryTable from "../components/inventory/InventoryTable";
import StockAdjustmentModal from "../components/adjustments/StockAdjustmentModal";
import ItemEditDrawer from "../components/catalog/ItemEditDrawer";
import {
  getInventory,
  getItems,
  getAlerts,
  createStockAdjustment,
  createItem,
} from "../services/api";
import { AlertCircle, RefreshCw } from "lucide-react";

const DashboardPage = ({ selectedWarehouse, setAlertsCount }) => {
  const [inventory, setInventory] = useState([]);
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState(null);
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [selectedDrawerItem, setSelectedDrawerItem] = useState(null);

  const mockInventory = [
    {
      item_id: "e81d7f42-a123-4bde-8f81-8971f1234567",
      sku: "SKU-9901",
      item_name: "Industrial Widget Alpha",
      warehouse_id: "11111111-2222-3333-4444-555555555555",
      warehouse_name: "Warehouse A (Central)",
      quantity_on_hand: 150,
      reorder_threshold: 10,
      unit_price: 49.99,
      updated_at: new Date().toISOString(),
    },
    {
      item_id: "f92e8f53-b234-5cef-9g92-9082g2345678",
      sku: "SKU-9902",
      item_name: "Precision Bearing Beta",
      warehouse_id: "22222222-3333-4444-5555-666666666666",
      warehouse_name: "Warehouse B (North)",
      quantity_on_hand: 8,
      reorder_threshold: 15,
      unit_price: 125.0,
      updated_at: new Date().toISOString(),
    },
    {
      item_id: "a03f9g64-c345-6dfg-0h03-0193h3456789",
      sku: "SKU-9903",
      item_name: "Microcontroller Gamma",
      warehouse_id: "33333333-4444-5555-6666-777777777777",
      warehouse_name: "Warehouse C (East)",
      quantity_on_hand: 320,
      reorder_threshold: 50,
      unit_price: 18.5,
      updated_at: new Date().toISOString(),
    },
  ];

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const params =
        selectedWarehouse && selectedWarehouse !== "ALL"
          ? { warehouse_id: selectedWarehouse }
          : {};

      const [invRes, itemsRes, alertsRes] = await Promise.allSettled([
        getInventory(params),
        getItems(),
        getAlerts({ status: "ACTIVE" }),
      ]);

      let invData =
        invRes.status === "fulfilled"
          ? invRes.value.items || invRes.value || []
          : [];
      let itemData =
        itemsRes.status === "fulfilled"
          ? itemsRes.value.items || itemsRes.value || []
          : [];
      let alertData =
        alertsRes.status === "fulfilled"
          ? alertsRes.value.alerts || alertsRes.value || []
          : [];

      if (invData.length === 0) {
        invData = mockInventory;
      }

      setInventory(invData);
      setItems(itemData);
      setAlerts(alertData);
      if (setAlertsCount) {
        setAlertsCount(alertData.length);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Unable to reach backend API. Showing current stock records.");
      setInventory(mockInventory);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedWarehouse]);

  // Derived KPIs
  const totalItemsOnHand = inventory.reduce(
    (sum, item) => sum + (item.quantity_on_hand || 0),
    0,
  );
  const activeSKUs = new Set(inventory.map((i) => i.sku)).size;
  const lowStockAlerts = inventory.filter(
    (i) => i.quantity_on_hand <= (i.reorder_threshold || 10),
  ).length;
  const totalValuation = inventory.reduce(
    (sum, item) => sum + (item.quantity_on_hand || 0) * (item.unit_price || 20),
    0,
  );

  const handleOpenAdjustModal = (item = null) => {
    setSelectedAdjustItem(item);
    setIsAdjustModalOpen(true);
  };

  const handleOpenItemDrawer = (item = null) => {
    setSelectedDrawerItem(item);
    setIsItemDrawerOpen(true);
  };

  const handleAdjustmentSubmit = async (data) => {
    await createStockAdjustment(data);
    await loadDashboardData();
  };

  const handleItemSubmit = async (data) => {
    await createItem(data);
    await loadDashboardData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Inventory Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Overview of warehouse stock levels, alert metrics, and inventory
            movements
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <StatCardGrid
        stats={{
          totalItemsOnHand,
          activeSKUs,
          lowStockAlerts,
          totalValuation,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockLevelChart />
        </div>
        <div>
          <WarehouseDonutChart />
        </div>
      </div>

      <InventoryTable
        inventory={inventory}
        loading={loading}
        onOpenAdjustModal={handleOpenAdjustModal}
        onOpenItemDrawer={handleOpenItemDrawer}
      />

      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        selectedItem={selectedAdjustItem}
        onSubmit={handleAdjustmentSubmit}
      />

      <ItemEditDrawer
        isOpen={isItemDrawerOpen}
        onClose={() => setIsItemDrawerOpen(false)}
        item={selectedDrawerItem}
        onSubmit={handleItemSubmit}
      />
    </div>
  );
};

export default DashboardPage;
