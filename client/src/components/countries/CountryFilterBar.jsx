import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";

export default function CountryFilterBar({
  search,
  setSearch,
  selectedContinent,
  setSelectedContinent,
  selectedStatus,
  setSelectedStatus,
  continents = [],
  onReset,
}) {
  return (
    <div className="bg-white border border-[#e3e8f0] rounded-xl p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707a8c]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search country name or code..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#171c29] focus:outline-none focus:ring-2 focus:ring-[#2663eb] focus:bg-white transition-all"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#707a8c] hidden sm:block" />
          <select
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#171c29] focus:outline-none focus:ring-2 focus:ring-[#2663eb]"
          >
            <option value="">All Continents</option>
            {continents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#171c29] focus:outline-none focus:ring-2 focus:ring-[#2663eb]"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Watchlist">Watchlist</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </select>

        {(search || selectedContinent || selectedStatus) && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
