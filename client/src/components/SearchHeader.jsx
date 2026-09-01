import React from "react";
import { Search, MapPin, Bookmark } from "lucide-react";

export default function SearchHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSaveSearch,
}) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 shadow-md space-y-4">
      <div className="max-w-3xl space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Find Your Dream House
        </h1>
        <p className="text-slate-300 text-sm">
          Search thousands of verified house listings by location, price, and
          amenities.
        </p>
      </div>

      <form
        onSubmit={onSearchSubmit}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by city, neighborhood, or keyword (e.g. Austin, TX)..."
            className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-sm"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>

        {onSaveSearch && (
          <button
            type="button"
            onClick={onSaveSearch}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition"
            title="Save current search criteria"
          >
            <Bookmark className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Save Search</span>
          </button>
        )}
      </form>
    </div>
  );
}
