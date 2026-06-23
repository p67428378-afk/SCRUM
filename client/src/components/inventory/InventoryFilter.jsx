import React, { useEffect, useState } from "react";
import { getAttributes } from "../../services/api";

export default function InventoryFilter({ filters, onFilterChange, onReset }) {
  const [attributes, setAttributes] = useState({
    categories: [],
    materials: [],
    gemstones: [],
  });

  useEffect(() => {
    const fetchAttrs = async () => {
      try {
        const data = await getAttributes();
        setAttributes(data);
      } catch (err) {
        console.error("Failed to fetch attributes", err);
      }
    };
    fetchAttrs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            filter_list
          </span>
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-primary hover:text-primary-fixed font-label-md text-label-md transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Search
          </label>
          <input
            type="text"
            name="search"
            value={filters.search || ""}
            onChange={handleChange}
            placeholder="Search by name..."
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Category
          </label>
          <select
            name="category"
            value={filters.category || ""}
            onChange={handleChange}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          >
            <option value="">All Categories</option>
            {attributes.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Material */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Material
          </label>
          <select
            name="material"
            value={filters.material || ""}
            onChange={handleChange}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          >
            <option value="">All Materials</option>
            {attributes.materials.map((mat) => (
              <option key={mat} value={mat}>
                {mat}
              </option>
            ))}
          </select>
        </div>

        {/* Gemstone */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Gemstone
          </label>
          <select
            name="gemstone"
            value={filters.gemstone || ""}
            onChange={handleChange}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          >
            <option value="">All Gemstones</option>
            {attributes.gemstones.map((gem) => (
              <option key={gem} value={gem}>
                {gem}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Min Price ($)
          </label>
          <input
            type="number"
            name="min_price"
            value={filters.min_price || ""}
            onChange={handleChange}
            placeholder="0"
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          />
        </div>

        {/* Max Price */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Max Price ($)
          </label>
          <input
            type="number"
            name="max_price"
            value={filters.max_price || ""}
            onChange={handleChange}
            placeholder="10000"
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
            Status
          </label>
          <select
            name="status"
            value={filters.status || ""}
            onChange={handleChange}
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary text-body-md"
          >
            <option value="">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>
    </div>
  );
}
