import React, { useState } from "react";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  PackageX,
  Plus,
} from "lucide-react";

export default function TeaInventoryTable({
  teas = [],
  onOpenModal,
  onRestockQuick,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Green Tea",
    "Black Tea",
    "Oolong",
    "Herbal",
    "Milk Tea",
  ];

  const filteredTeas = teas.filter((tea) => {
    const matchesSearch =
      tea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tea.supplier_name &&
        tea.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || tea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (stock, minThreshold = 500) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <PackageX className="w-3 h-3 mr-1" /> OUT OF STOCK
        </span>
      );
    }
    if (stock < minThreshold * 0.7) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 animate-pulse">
          <AlertCircle className="w-3 h-3 mr-1" /> CRITICAL LOW
        </span>
      );
    }
    if (stock < minThreshold) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <AlertCircle className="w-3 h-3 mr-1" /> LOW STOCK
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
        <CheckCircle2 className="w-3 h-3 mr-1" /> In Stock
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search and Category Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tea catalog or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider border-b border-gray-200">
              <th className="py-3.5 px-4">Tea Variety</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Current Stock</th>
              <th className="py-3.5 px-4">Min Threshold</th>
              <th className="py-3.5 px-4">Unit Price</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {filteredTeas.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500">
                  No tea varieties found matching criteria.
                </td>
              </tr>
            ) : (
              filteredTeas.map((tea) => {
                const isLow =
                  tea.current_stock_grams < (tea.min_threshold_grams || 500);
                return (
                  <tr
                    key={tea.id || tea.name}
                    className={`hover:bg-gray-50 ${isLow ? "bg-amber-50/30" : ""}`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {tea.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                        {tea.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={isLow ? "text-red-600" : "text-emerald-700"}
                      >
                        {tea.current_stock_grams}g
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {tea.min_threshold_grams || 500}g
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      ${Number(tea.unit_price || 0).toFixed(2)} / 100g
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {tea.supplier_name || "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(
                        tea.current_stock_grams,
                        tea.min_threshold_grams,
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onRestockQuick && onRestockQuick(tea)}
                        className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded transition"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Restock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
