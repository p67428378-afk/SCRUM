import React from "react";

export const SuggestionItem = ({
  suggestion,
  isSelected = false,
  onSelect,
  onHover,
}) => {
  const {
    id,
    title,
    category_name,
    price,
    thumbnail_url,
    tags = [],
  } = suggestion;

  return (
    <div
      onClick={() => onSelect(suggestion)}
      onMouseEnter={() => onHover && onHover()}
      className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${
        isSelected
          ? "bg-[#f2f5fa] border-l-4 border-[#2663eb]"
          : "hover:bg-[#f2f5fa]"
      }`}
      role="option"
      aria-selected={isSelected}
      data-testid={`suggestion-item-${id}`}
    >
      <div className="w-10 h-10 bg-[#e3e8f0] rounded-md overflow-hidden shrink-0 flex items-center justify-center text-lg">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>📦</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-sm text-[#171c29] truncate">
            {title}
          </h4>
          <span className="font-bold text-sm text-[#2663eb] shrink-0">
            ${typeof price === "number" ? price.toFixed(2) : price}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {category_name && (
            <span className="text-xs text-[#707a8c] bg-[#f2f5fa] px-1.5 py-0.5 rounded border border-[#e3e8f0]">
              {category_name}
            </span>
          )}
          {tags &&
            tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-xs text-[#707a8c]">
                #{tag}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionItem;
