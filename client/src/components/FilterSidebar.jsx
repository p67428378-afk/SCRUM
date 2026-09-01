import React from "react";
import { Filter, RotateCcw } from "lucide-react";

export default function FilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
}) {
  const propertyTypes = ["Single Family", "Condo", "Townhouse", "Multi-Family"];
  const amenityOptions = [
    "Pool",
    "Garage",
    "Pet-friendly",
    "Waterfront",
    "Gym",
    "Air Conditioning",
  ];

  const handlePropertyTypeChange = (type) => {
    let currentTypes = filters.property_type
      ? filters.property_type.split(",")
      : [];
    if (currentTypes.includes(type)) {
      currentTypes = currentTypes.filter((t) => t !== type);
    } else {
      currentTypes.push(type);
    }
    onFilterChange("property_type", currentTypes.join(","));
  };

  const handleAmenityChange = (amenity) => {
    let currentAmenities = filters.amenities
      ? filters.amenities.split(",")
      : [];
    if (currentAmenities.includes(amenity)) {
      currentAmenities = currentAmenities.filter((a) => a !== amenity);
    } else {
      currentAmenities.push(amenity);
    }
    onFilterChange("amenities", currentAmenities.join(","));
  };

  return (
    <aside className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Filter Properties
          </h2>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-blue-600 flex items-center space-x-1 font-medium transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Location & Radius */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            City / Neighborhood
          </label>
          <input
            type="text"
            value={filters.city || ""}
            onChange={(e) => onFilterChange("city", e.target.value)}
            placeholder="e.g. Austin"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Radius (Miles)
          </label>
          <select
            value={filters.radius || ""}
            onChange={(e) => onFilterChange("radius", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Any Radius</option>
            <option value="5">Within 5 miles</option>
            <option value="10">Within 10 miles</option>
            <option value="25">Within 25 miles</option>
            <option value="50">Within 50 miles</option>
          </select>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
          Max Price
        </label>
        <input
          type="range"
          min="100000"
          max="2000000"
          step="50000"
          value={filters.max_price || 2000000}
          onChange={(e) => onFilterChange("max_price", e.target.value)}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1 font-medium">
          <span>$100k</span>
          <span className="text-blue-600 font-bold">
            ${Number(filters.max_price || 2000000).toLocaleString()}
          </span>
          <span>$2M+</span>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
          Property Type
        </label>
        <div className="space-y-2 text-sm text-slate-700">
          {propertyTypes.map((type) => {
            const isChecked = (filters.property_type || "")
              .split(",")
              .includes(type);
            return (
              <label
                key={type}
                className="flex items-center space-x-2.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handlePropertyTypeChange(type)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm font-medium">{type}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Beds & Baths */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Bedrooms
          </label>
          <select
            value={filters.bedrooms || ""}
            onChange={(e) => onFilterChange("bedrooms", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Any</option>
            <option value="1">1+ Beds</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Bathrooms
          </label>
          <select
            value={filters.bathrooms || ""}
            onChange={(e) => onFilterChange("bathrooms", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Any</option>
            <option value="1">1+ Baths</option>
            <option value="2">2+ Baths</option>
            <option value="3">3+ Baths</option>
          </select>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
          Amenities
        </label>
        <div className="space-y-2 text-sm text-slate-700">
          {amenityOptions.map((amenity) => {
            const isChecked = (filters.amenities || "")
              .split(",")
              .includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center space-x-2.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleAmenityChange(amenity)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm font-medium">{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
