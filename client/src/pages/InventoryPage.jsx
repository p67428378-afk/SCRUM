import React, { useState, useEffect } from "react";
import { inventoryApi } from "../services/api";
import InventoryTable from "../components/inventory/InventoryTable";
import StockAdjustmentModal from "../components/inventory/StockAdjustmentModal";
import AlertBanner from "../components/common/AlertBanner";
import { Package } from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getInventory();
      setInventory(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = async (itemId, adjustmentData) => {
    await inventoryApi.adjustStock(itemId, adjustmentData);
    setSuccessMessage(
      `Inventory stock updated successfully for ${selectedItem?.item_name || "Item"}.`,
    );
    loadInventory();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-800" />
            Input Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consumables tracking for fertilizers, seeds, pesticides, and fuel
            with automated low-stock reorder thresholds.
          </p>
        </div>
      </div>

      {successMessage && (
        <AlertBanner
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* Inventory Table */}
      <InventoryTable
        inventoryData={inventory}
        onAdjustStock={handleOpenModal}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onSubmit={handleAdjustSubmit}
      />
    </div>
  );
}
