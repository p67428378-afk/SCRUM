import React from "react";
import PropTypes from "prop-types";
import { Filter, RotateCcw } from "lucide-react";

export default function FilterSidebar({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange,
  sortBy,
  onSortChange,
  onResetFilters,
}) {
  return (
    <aside className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-brand-950 font-bold">
          <Filter className="w-4 h-4 text-accent" />
          <h2 className="text-base font-serif">Filters</h2>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-brand-950 flex items-center space-x-1 font-medium"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label
          htmlFor="sort-select"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
        >
          Sort By
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-950"
        >
          <option value="">Featured / Title (A-Z)</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Categories
        </h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-700 hover:text-brand-950">
            <input
              type="radio"
              name="category"
              checked={!selectedCategoryId}
              onChange={() => onSelectCategory("")}
              className="w-4 h-4 text-brand-950 focus:ring-brand-950"
            />
            <span
              className={!selectedCategoryId ? "font-bold text-brand-950" : ""}
            >
              All Categories
            </span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center space-x-2 cursor-pointer text-sm text-slate-700 hover:text-brand-950"
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategoryId === cat.id}
                onChange={() => onSelectCategory(cat.id)}
                className="w-4 h-4 text-brand-950 focus:ring-brand-950"
              />
              <span
                className={
                  selectedCategoryId === cat.id
                    ? "font-bold text-brand-950"
                    : ""
                }
              >
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Price Range ($)
        </h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            min="0"
            value={minPrice}
            onChange={(e) => onPriceChange("min", e.target.value)}
            className="w-1/2 py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-950"
          />
          <span className="text-slate-400 text-sm">-</span>
          <input
            type="number"
            placeholder="Max"
            min="0"
            value={maxPrice}
            onChange={(e) => onPriceChange("max", e.target.value)}
            className="w-1/2 py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-950"
          />
        </div>
      </div>
    </aside>
  );
}

FilterSidebar.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    }),
  ),
  selectedCategoryId: PropTypes.string,
  onSelectCategory: PropTypes.func.isRequired,
  minPrice: PropTypes.string,
  maxPrice: PropTypes.string,
  onPriceChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string,
  onSortChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};
