import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getInventory, deleteInventoryItem } from "../services/api";
import InventoryFilter from "../components/inventory/InventoryFilter";
import InventoryTable from "../components/inventory/InventoryTable";

export default function InventoryListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse filters from URL search params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const material = searchParams.get("material") || "";
  const gemstone = searchParams.get("gemstone") || "";
  const min_price = searchParams.get("min_price") || "";
  const max_price = searchParams.get("max_price") || "";
  const status = searchParams.get("status") || "";

  const filters = {
    search,
    category,
    material,
    gemstone,
    min_price,
    max_price,
    status,
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(category && { category }),
        ...(material && { material }),
        ...(gemstone && { gemstone }),
        ...(min_price && { min_price: parseFloat(min_price) }),
        ...(max_price && { max_price: parseFloat(max_price) }),
        ...(status && { status }),
      };

      const data = await getInventory(params);
      setItems(data.items || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
      setError("Failed to load inventory items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [
    page,
    limit,
    search,
    category,
    material,
    gemstone,
    min_price,
    max_price,
    status,
  ]);

  const handleFilterChange = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    newParams.set("page", "1"); // Reset to first page on filter change
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({ page: "1", limit: "20" });
  };

  const handleDelete = async (id) => {
    try {
      await deleteInventoryItem(id);
      fetchInventory(); // Refresh list
    } catch (err) {
      console.error("Failed to delete item", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-gutter">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
            Jewelry Inventory
          </h2>
          <p className="text-on-surface-variant font-body-md">
            Manage, search, and filter your jewelry stock levels.
          </p>
        </div>
        <button
          onClick={() => navigate("/inventory/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity font-label-md text-label-md shadow-[0_0_15px_rgba(192,193,255,0.2)]"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Item
        </button>
      </div>

      {/* Filters */}
      <InventoryFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-error-container/20 border border-error/20 rounded-xl p-4 text-error">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-2">
            sync
          </span>
          Loading inventory...
        </div>
      ) : (
        <>
          <InventoryTable items={items} onDelete={handleDelete} />

          {/* Pagination */}
          <div className="p-4 bg-surface border border-outline-variant rounded-xl flex justify-between items-center text-sm">
            <span className="text-on-surface-variant font-label-sm">
              Showing {Math.min(total, (page - 1) * limit + 1)} to{" "}
              {Math.min(total, page * limit)} of {total} entries
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-high disabled:opacity-50 text-on-surface-variant transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    p === page
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant hover:bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-high disabled:opacity-50 text-on-surface-variant transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
