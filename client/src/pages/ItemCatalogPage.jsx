import React, { useState, useEffect } from "react";
import ItemCatalogTable from "../components/catalog/ItemCatalogTable";
import ItemEditDrawer from "../components/catalog/ItemEditDrawer";
import { getItems, createItem } from "../services/api";
import { AlertCircle, RefreshCw } from "lucide-react";

const ItemCatalogPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const mockCatalog = [
    {
      id: "e81d7f42-a123-4bde-8f81-8971f1234567",
      sku: "SKU-9901",
      name: "Industrial Widget Alpha",
      category_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      unit_price: 49.99,
      reorder_threshold: 10,
      reorder_quantity: 50,
    },
    {
      id: "f92e8f53-b234-5cef-9g92-9082g2345678",
      sku: "SKU-9902",
      name: "Precision Bearing Beta",
      category_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      unit_price: 125.0,
      reorder_threshold: 15,
      reorder_quantity: 40,
    },
    {
      id: "a03f9g64-c345-6dfg-0h03-0193h3456789",
      sku: "SKU-9903",
      name: "Microcontroller Gamma",
      category_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      unit_price: 18.5,
      reorder_threshold: 50,
      reorder_quantity: 200,
    },
  ];

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getItems();
      const list = data.items || data || [];
      setItems(list.length > 0 ? list : mockCatalog);
    } catch (err) {
      console.error("Failed to load catalog:", err);
      setError(
        "Could not connect to item catalog service. Showing default items.",
      );
      setItems(mockCatalog);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleOpenDrawer = (item = null) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleItemSubmit = async (itemData) => {
    await createItem(itemData);
    await loadItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Item Catalog Management
          </h2>
          <p className="text-xs text-slate-400">
            Configure item master data, SKUs, reorder thresholds, and default
            order quantities
          </p>
        </div>
        <button
          onClick={loadItems}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Catalog
        </button>
      </div>

      {error && (
        <div className="p-3 mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <ItemCatalogTable
        items={items}
        loading={loading}
        onOpenDrawer={handleOpenDrawer}
      />

      <ItemEditDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedItem}
        onSubmit={handleItemSubmit}
      />
    </div>
  );
};

export default ItemCatalogPage;
