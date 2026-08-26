import React from "react";
import PropTypes from "prop-types";
import { Search, RotateCcw, Filter } from "lucide-react";

export default function FilterBar({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  type,
  onTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  categories,
  onReset,
}) {
  const hasActiveFilters =
    Boolean(search) ||
    Boolean(categoryId) ||
    Boolean(type) ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#2663EB]" />
          <span className="text-sm font-bold text-[#171C29]">
            Filter & Search Transactions
          </span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by description (e.g. Grocery)..."
            className="w-full pl-10 pr-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition"
          />
        </div>

        {/* Category Dropdown */}
        <div className="md:col-span-3">
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition text-[#171C29]"
            aria-label="Filter by Category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type Filter */}
        <div className="md:col-span-2">
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition text-[#171C29]"
            aria-label="Filter by Type"
          >
            <option value="">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>

        {/* Date Range - Start */}
        <div className="md:col-span-3 grid grid-cols-2 gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            placeholder="Start Date"
            aria-label="Start Date"
            className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition text-[#171C29]"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            placeholder="End Date"
            aria-label="End Date"
            className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition text-[#171C29]"
          />
        </div>
      </div>
    </div>
  );
}

FilterBar.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  categoryId: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  startDate: PropTypes.string.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  endDate: PropTypes.string.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onReset: PropTypes.func.isRequired,
};
