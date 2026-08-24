import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { itemService, inventoryService } from "../services/api";
import Navbar from "../components/layout/Navbar";
import StatCard from "../components/inventory/StatCard";
import SearchBar from "../components/common/SearchBar";
import InventoryTable from "../components/inventory/InventoryTable";
import Modal from "../components/common/Modal";
import InventoryForm from "../components/inventory/InventoryForm";
import Button from "../components/common/Button";
import { Plus, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [itemsData, lowStockData] = await Promise.all([
        itemService.listItems(),
        inventoryService.listLowStock(),
      ]);
      setItems(itemsData);
      setLowStockItems(lowStockData);
    } catch (err) {
      setError("Failed to load inventory data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateOrUpdate = async (payload) => {
    try {
      if (editingItem) {
        await itemService.updateItem(editingItem.id, payload);
        // If reorder threshold was updated, update inventory too
        if (payload.reorder_threshold !== undefined) {
          await inventoryService.updateStock(editingItem.id, {
            current_stock: parseFloat(
              editingItem.inventory?.current_stock || 0,
            ),
            reorder_threshold: parseFloat(payload.reorder_threshold),
          });
        }
      } else {
        await itemService.createItem(payload);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchDashboardData();
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "An error occurred while saving the item.",
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await itemService.deleteItem(id);
        fetchDashboardData();
      } catch (err) {
        alert(err.response?.data?.detail || "Failed to delete item.");
      }
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Filter items locally for search, category, and stock status
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "All" || item.category === category;

    const isLow =
      parseFloat(item.inventory?.current_stock || 0) <=
      parseFloat(item.inventory?.reorder_threshold || 0);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Low Stock" && isLow) ||
      (statusFilter === "In Stock" && !isLow);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate metrics
  const totalItems = items.length;
  const lowStockCount = lowStockItems.length;
  const totalStockValue = items.reduce((sum, item) => {
    const stock = parseFloat(item.inventory?.current_stock || 0);
    const price = parseFloat(item.unit_price || 0);
    return sum + stock * price;
  }, 0);

  const canAdd = user?.role === "Admin" || user?.role === "Manager";

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col">
      <Navbar />

      <div className="flex-1 p-[32px] flex flex-col gap-[24px] max-w-[1400px] mx-auto w-full">
        {/* Metrics */}
        <div className="flex gap-[16px] flex-wrap">
          <StatCard
            title="Total Items"
            value={totalItems}
            badgeText="Active"
            badgeVariant="info"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockCount}
            badgeText={lowStockCount > 0 ? "Alert Active" : "Healthy"}
            badgeVariant={lowStockCount > 0 ? "danger" : "success"}
          />
          <StatCard
            title="Total Stock Value"
            value={`$${totalStockValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            badgeText="Healthy"
            badgeVariant="success"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex gap-[12px] items-center flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by Name or SKU (e.g., Fuji Apples, PROD-APL-001)..."
            />
          </div>

          <div className="flex flex-col gap-[4px] min-w-[150px]">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none font-medium text-[#171c29]"
            >
              <option value="All">All Categories</option>
              <option value="Produce">Produce</option>
              <option value="Dairy">Dairy</option>
              <option value="Bakery">Bakery</option>
              <option value="Meat">Meat</option>
              <option value="Pantry">Pantry</option>
            </select>
          </div>

          <div className="flex flex-col gap-[4px] min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusStatusFilter(e.target.value)}
              className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none font-medium text-[#171c29]"
            >
              <option value="All">All Items</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>

          {canAdd && (
            <Button
              onClick={handleAddClick}
              variant="primary"
              className="h-[46px]"
            >
              <Plus size={18} />
              <span>Add New Item</span>
            </Button>
          )}
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockCount > 0 && (
          <div className="bg-[#eb9917] text-white flex gap-[12px] items-center p-[12px] rounded-[10px] shadow-sm">
            <AlertTriangle size={20} className="shrink-0" />
            <p className="font-medium text-[14px]">
              Low Stock Alert: {lowStockCount} items are currently below their
              reorder threshold. Please review and restock.
            </p>
          </div>
        )}

        {/* Main Catalog Card */}
        <div className="bg-white border border-[#e3e8f0] flex flex-col gap-[12px] p-[24px] rounded-[14px] shadow-sm">
          <h3 className="font-bold text-[#171c29] text-[18px]">
            Grocery Inventory Catalog
          </h3>

          {loading ? (
            <div className="p-[48px] text-center text-[#707a8c]">
              Loading inventory catalog...
            </div>
          ) : error ? (
            <div className="p-[48px] text-center text-[#db2626] font-medium">
              {error}
            </div>
          ) : (
            <InventoryTable
              items={filteredItems}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Grocery Item" : "Add New Grocery Item"}
      >
        <InventoryForm
          initialData={editingItem}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
