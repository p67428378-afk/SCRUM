import React from "react";
import {
  Filter,
  RotateCcw,
  Search,
  MapPin,
  DollarSign,
  Star,
  Award,
} from "lucide-react";

export default function ListingFilter({ filters, onChange, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-[#e3e8f0] shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#e3e8f0]">
        <div className="flex items-center gap-2 font-bold text-textPrimary text-sm">
          <Filter className="w-4 h-4 text-primary" />
          <span>Filter Listings</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-textMuted hover:text-primary transition font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Search keyword */}
      <div>
        <label className="block text-xs font-semibold text-textMuted mb-1">
          Keyword Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            name="search"
            value={filters.search || ""}
            onChange={handleChange}
            placeholder="Search title, breed, location..."
            className="w-full pl-9 pr-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Breed */}
      <div>
        <label className="block text-xs font-semibold text-textMuted mb-1">
          Breed
        </label>
        <input
          type="text"
          name="breed"
          value={filters.breed || ""}
          onChange={handleChange}
          placeholder="e.g. Golden Retriever, Beagle"
          className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-semibold text-textMuted mb-1">
          Location
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            name="location"
            value={filters.location || ""}
            onChange={handleChange}
            placeholder="e.g. Austin, TX"
            className="w-full pl-9 pr-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-textMuted mb-1">
          Price Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="min_price"
            value={filters.min_price || ""}
            onChange={handleChange}
            placeholder="Min ($)"
            className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <input
            type="number"
            name="max_price"
            value={filters.max_price || ""}
            onChange={handleChange}
            placeholder="Max ($)"
            className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Age Range (months) */}
      <div>
        <label className="block text-xs font-semibold text-textMuted mb-1">
          Age Range (Months)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="min_age"
            value={filters.min_age || ""}
            onChange={handleChange}
            placeholder="Min mo"
            className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <input
            type="number"
            name="max_age"
            value={filters.max_age || ""}
            onChange={handleChange}
            placeholder="Max mo"
            className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Seller Rating */}
      <div>
        <label className="block text-xs font-semibold text-textMuted mb-1">
          Min Seller Rating
        </label>
        <select
          name="min_rating"
          value={filters.min_rating || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none text-textPrimary"
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
          <option value="3.5">3.5+ Stars</option>
        </select>
      </div>
    </div>
  );
}
