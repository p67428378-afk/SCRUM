import React, { useState } from "react";
import { Search, Coffee } from "lucide-react";

export default function TeaSelectionGrid({
  teas = [],
  selectedTea,
  onSelectTea,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Green", "Black", "Oolong", "Herbal", "Milk Tea"];

  const filteredTeas = teas.filter((tea) => {
    const matchesSearch = tea.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      tea.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center">
          <Coffee className="w-5 h-5 text-emerald-700 mr-2" />
          1. Select Tea Variety
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          {filteredTeas.length} Available
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 mb-4 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tea catalog..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Tea Grid */}
      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[420px] pr-1">
        {filteredTeas.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-gray-500 text-sm">
            No tea varieties match search.
          </div>
        ) : (
          filteredTeas.map((tea) => {
            const isSelected = selectedTea?.id === tea.id;
            const isOutOfStock = tea.current_stock_grams <= 0;

            return (
              <button
                key={tea.id || tea.name}
                type="button"
                disabled={isOutOfStock}
                onClick={() => onSelectTea(tea)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500"
                    : isOutOfStock
                      ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                      : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-xs"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                      {tea.name}
                    </h3>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded mb-2">
                    {tea.category}
                  </span>
                </div>
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-100">
                  <span className="text-emerald-700 font-bold text-sm">
                    ${Number(tea.unit_price || 5.0).toFixed(2)}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${isOutOfStock ? "text-red-600 font-bold" : "text-gray-500"}`}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : `${tea.current_stock_grams}g stock`}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
