import React from "react";

export const CategoryFilterPills = ({
  categories = [],
  selectedCategoryId = null,
  onSelectCategory,
  totalCount = 0,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none text-xs">
      <span className="font-semibold text-[#707a8c] whitespace-nowrap">
        Category:
      </span>
      <button
        onClick={() => onSelectCategory(null)}
        type="button"
        className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap focus:outline-none ${
          selectedCategoryId === null
            ? "bg-[#2663eb] text-white"
            : "bg-[#f2f5fa] text-[#707a8c] hover:bg-[#e3e8f0]"
        }`}
      >
        All {totalCount ? `(${totalCount})` : ""}
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(isSelected ? null : cat.id)}
            type="button"
            className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap focus:outline-none ${
              isSelected
                ? "bg-[#2663eb] text-white"
                : "bg-[#f2f5fa] text-[#707a8c] hover:bg-[#e3e8f0]"
            }`}
          >
            {cat.name} {cat.count !== undefined ? `(${cat.count})` : ""}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilterPills;
