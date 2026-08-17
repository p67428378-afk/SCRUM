import React from "react";
import { Search, Globe, MapPin, Filter, RefreshCw } from "lucide-react";

export default function FilterBar({
  country,
  setCountry,
  city,
  setCity,
  status,
  setStatus,
  onReset,
}) {
  const countries = [
    { code: "", label: "All Countries" },
    { code: "USA", label: "United States 🇺🇸" },
    { code: "Germany", label: "Germany 🇩🇪" },
    { code: "UK", label: "United Kingdom 🇬🇧" },
    { code: "Japan", label: "Japan 🇯🇵" },
  ];

  const statuses = [
    { value: "", label: "All Statuses" },
    { value: "On Sale", label: "On Sale 🟢" },
    { value: "Upcoming", label: "Upcoming 🟡" },
    { value: "Sold Out", label: "Sold Out 🔴" },
  ];

  return (
    <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-2xl p-4 sm:p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-[#7a3bed]" />
          <h3 className="text-base font-bold text-white">
            Filter Concert Schedule
          </h3>
        </div>
        {(country || city || status) && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1 text-xs text-[#a855f7] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Country Filter */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1 flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-[#7a3bed]" />
            <span>Country</span>
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#7a3bed] transition-colors"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-[#7a3bed]" />
            <span>City Search</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Berlin, London, Tokyo..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-[#5d637e] focus:outline-none focus:border-[#7a3bed] transition-colors"
            />
            <Search className="w-4 h-4 text-[#5d637e] absolute left-3 top-3" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-[#7a3bed]" />
            <span>Show Status</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#7a3bed] transition-colors"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
