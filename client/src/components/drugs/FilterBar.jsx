import React from "react";
import { Search, Plus, Filter, RotateCcw } from "lucide-react";

export const FilterBar = ({
  searchTerm = "",
  onSearchChange = () => {},
  categoryFilter = "",
  onCategoryChange = () => {},
  statusFilter = "",
  onStatusChange = () => {},
  onAddNew = () => {},
  categories = [],
  onResetFilters = () => {},
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Search Input & Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3 flex-grow max-w-3xl">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by drug name, generic name, batch no, manufacturer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Category Dropdown */}
        <div className="sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 font-medium"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="normal">Normal Stock</option>
            <option value="low_stock">Low Stock (&lt;50)</option>
            <option value="near_expiry">Near Expiry (&lt;30d)</option>
          </select>
        </div>

        {/* Reset Button if filtered */}
        {(searchTerm || categoryFilter || statusFilter) && (
          <button
            onClick={onResetFilters}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center justify-center"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Add New Drug Button */}
      <div className="flex-shrink-0">
        <button
          onClick={onAddNew}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Drug</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
