import React from "react";
import { Filter, X } from "lucide-react";

export default function FilterSidebar({ filters, onFilterChange, onReset }) {
  const categories = [
    { id: "clothing", label: "Clothing" },
    { id: "accessories", label: "Accessories" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL"];
  const colors = ["Black", "Blue", "White", "Red", "Gray", "Denim", "Gold"];

  const handleCategoryClick = (catId) => {
    const currentCat = filters.category === catId ? "" : catId;
    onFilterChange({ ...filters, category: currentCat });
  };

  const handleSizeClick = (sz) => {
    const currentSize = filters.size === sz ? "" : sz;
    onFilterChange({ ...filters, size: currentSize });
  };

  const handleColorClick = (cl) => {
    const currentColor = filters.color === cl ? "" : cl;
    onFilterChange({ ...filters, color: currentColor });
  };

  return (
    <aside className="bg-white p-5 rounded-xl border border-[#e3e8f0] w-full md:w-64 shrink-0 space-y-6">
      <div className="flex items-center justify-between border-b border-[#e3e8f0] pb-3">
        <div className="flex items-center gap-2 font-bold text-[#171c29] text-base">
          <Filter className="w-4 h-4 text-[#2663eb]" />
          <span>Filters</span>
        </div>
        {(filters.category ||
          filters.size ||
          filters.color ||
          filters.min_price ||
          filters.max_price) && (
          <button
            onClick={onReset}
            className="text-xs text-[#2663eb] hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider mb-2.5">
          Category
        </h4>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 text-sm text-[#171c29] cursor-pointer hover:text-[#2663eb]"
            >
              <input
                type="checkbox"
                checked={filters.category === cat.id}
                onChange={() => handleCategoryClick(cat.id)}
                className="rounded border-[#e3e8f0] text-[#2663eb] focus:ring-[#2663eb]"
              />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h4 className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider mb-2.5">
          Size
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => handleSizeClick(sz)}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                filters.size === sz
                  ? "bg-[#2663eb] text-white border-[#2663eb]"
                  : "bg-[#f7fafc] text-[#171c29] border-[#e3e8f0] hover:border-[#2663eb]"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h4 className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider mb-2.5">
          Color
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {colors.map((cl) => (
            <button
              key={cl}
              type="button"
              onClick={() => handleColorClick(cl)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                filters.color === cl
                  ? "bg-[#171c29] text-white border-[#171c29]"
                  : "bg-[#f7fafc] text-[#707a8c] border-[#e3e8f0] hover:border-[#171c29]"
              }`}
            >
              {cl}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider mb-2.5">
          Price Range ($)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, min_price: e.target.value })
            }
            className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2663eb]"
          />
          <span className="text-[#707a8c] text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, max_price: e.target.value })
            }
            className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#2663eb]"
          />
        </div>
      </div>
    </aside>
  );
}
