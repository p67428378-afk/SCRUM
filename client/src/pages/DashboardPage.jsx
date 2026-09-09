import React, { useState, useEffect, useMemo } from "react";
import MetricCards from "../components/drugs/MetricCards.jsx";
import FilterBar from "../components/drugs/FilterBar.jsx";
import DrugInventoryTable from "../components/drugs/DrugInventoryTable.jsx";
import DrugModalForm from "../components/drugs/DrugModalForm.jsx";
import api from "../services/api.js";

export const DashboardPage = ({ onAlertCountChange = () => {} }) => {
  const [drugs, setDrugs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [drugToDelete, setDrugToDelete] = useState(null);

  // Fetch drugs from API
  const fetchDrugs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDrugs({ skip: 0, limit: 100 });
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.items)) {
        items = data.items;
      }
      setDrugs(items);

      // Update alert count
      const alertItems = items.filter((item) => {
        const isLow = item.is_low_stock ?? item.stock_quantity < 50;
        const isNear = item.is_near_expiry;
        return isLow || isNear;
      });
      onAlertCountChange(alertItems.length);
    } catch (err) {
      console.error("Failed to fetch drugs:", err);
      setError(
        "Could not connect to backend API. Please ensure backend server is running.",
      );
      // Fallback sample data if API fails in dev mode so UI can be previewed gracefully
      setDrugs(getSampleDrugs());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  // Compute Categories
  const categories = useMemo(() => {
    const set = new Set();
    drugs.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [drugs]);

  // Compute Metrics
  const metrics = useMemo(() => {
    const total_products = drugs.length;
    let low_stock_count = 0;
    let near_expiry_count = 0;
    let total_value = 0;

    drugs.forEach((d) => {
      const isLow = d.is_low_stock ?? d.stock_quantity < 50;
      const isNear = d.is_near_expiry ?? false;
      if (isLow) low_stock_count++;
      if (isNear) near_expiry_count++;
      total_value += (d.stock_quantity || 0) * (d.unit_price || 0);
    });

    return {
      total_products,
      low_stock_count,
      near_expiry_count,
      total_value,
    };
  }, [drugs]);

  // Filtered Drugs list
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        drug.name?.toLowerCase().includes(search) ||
        drug.generic_name?.toLowerCase().includes(search) ||
        drug.batch_number?.toLowerCase().includes(search) ||
        drug.manufacturer?.toLowerCase().includes(search);

      // Category
      const matchesCategory =
        !categoryFilter || drug.category === categoryFilter;

      // Status
      const isLow = drug.is_low_stock ?? drug.stock_quantity < 50;
      const isNear = drug.is_near_expiry ?? false;

      let matchesStatus = true;
      if (statusFilter === "low_stock") matchesStatus = isLow;
      if (statusFilter === "near_expiry") matchesStatus = isNear;
      if (statusFilter === "normal") matchesStatus = !isLow && !isNear;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [drugs, searchTerm, categoryFilter, statusFilter]);

  // Handle Save (Create / Update)
  const handleSaveDrug = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedDrug && selectedDrug.id) {
        await api.updateDrug(selectedDrug.id, formData);
      } else {
        await api.createDrug(formData);
      }
      setIsModalOpen(false);
      setSelectedDrug(null);
      await fetchDrugs();
    } catch (err) {
      console.error("Error saving drug record:", err);
      alert("Failed to save drug record. Check server logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteDrug = async () => {
    if (!drugToDelete) return;
    try {
      await api.deleteDrug(drugToDelete.id);
      setDrugToDelete(null);
      await fetchDrugs();
    } catch (err) {
      console.error("Error deleting drug:", err);
      alert("Failed to delete drug record.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Drug Inventory Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor real-time pharmaceutical stock levels, batch numbers, and
            expiration dates.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDrugs}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* API Error Notification Banner */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs font-bold underline ml-4 hover:text-amber-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <MetricCards metrics={metrics} />

      {/* Filter Toolbar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categories={categories}
        onAddNew={() => {
          setSelectedDrug(null);
          setIsModalOpen(true);
        }}
        onResetFilters={() => {
          setSearchTerm("");
          setCategoryFilter("");
          setStatusFilter("");
        }}
      />

      {/* Inventory Table */}
      <DrugInventoryTable
        drugs={filteredDrugs}
        isLoading={isLoading}
        onEdit={(drug) => {
          setSelectedDrug(drug);
          setIsModalOpen(true);
        }}
        onDelete={(drug) => setDrugToDelete(drug)}
      />

      {/* Modal Form */}
      <DrugModalForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDrug(null);
        }}
        onSubmit={handleSaveDrug}
        drug={selectedDrug}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {drugToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                {drugToDelete.name}
              </span>{" "}
              (Batch: {drugToDelete.batch_number})? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDrugToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDrug}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fallback mock dataset if API is unreachable
function getSampleDrugs() {
  return [
    {
      id: "1",
      name: "Amoxicillin 500mg",
      generic_name: "Amoxicillin Trihydrate",
      dosage: "500mg Capsule",
      manufacturer: "Pfizer Inc.",
      batch_number: "BATCH-2026-A",
      stock_quantity: 500,
      expiration_date: "2027-12-31",
      category: "Antibiotics",
      unit_price: 15.0,
      is_low_stock: false,
      is_near_expiry: false,
    },
    {
      id: "2",
      name: "Ibuprofen 200mg",
      generic_name: "Ibuprofen",
      dosage: "200mg Tablet",
      manufacturer: "Bayer Health",
      batch_number: "BATCH-2026-B",
      stock_quantity: 15,
      expiration_date: "2026-10-15",
      category: "Analgesics",
      unit_price: 8.5,
      is_low_stock: true,
      is_near_expiry: false,
    },
    {
      id: "3",
      name: "Paracetamol 650mg",
      generic_name: "Acetaminophen",
      dosage: "650mg Tablet",
      manufacturer: "GlaxoSmithKline",
      batch_number: "BATCH-2026-C",
      stock_quantity: 320,
      expiration_date: "2026-09-30",
      category: "Antipyretics",
      unit_price: 5.2,
      is_low_stock: false,
      is_near_expiry: true,
    },
    {
      id: "4",
      name: "Metformin 500mg",
      generic_name: "Metformin Hydrochloride",
      dosage: "500mg Tablet",
      manufacturer: "Novartis",
      batch_number: "BATCH-2026-D",
      stock_quantity: 40,
      expiration_date: "2028-05-20",
      category: "Diabetic",
      unit_price: 12.0,
      is_low_stock: true,
      is_near_expiry: false,
    },
  ];
}

export default DashboardPage;
