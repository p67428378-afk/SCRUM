import React from "react";
import SearchBar from "../common/SearchBar";

export default function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  categories = [],
}) {
  return (
    <div className="glass-card rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="w-full md:w-1/3">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search transactions..."
        />
      </div>

      <div className="w-full md:w-auto flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-on-surface-variant">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-1.5 px-3 text-sm focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-on-surface-variant">
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-1.5 px-3 text-sm focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-on-surface-variant">
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-1.5 px-3 text-sm focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
          />
        </div>
      </div>
    </div>
  );
}
