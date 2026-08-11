import React from "react";

export const RecentSearchesList = ({
  recentSearches = [],
  onSelectRecent,
  onRemoveRecent,
  onClearAll,
}) => {
  if (!recentSearches || recentSearches.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-[#707a8c]">
        No recent searches. Type to start searching products...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e3e8f0]">
        <span className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider">
          Recent Searches
        </span>
        {onClearAll && (
          <button
            onClick={onClearAll}
            type="button"
            className="text-xs text-[#2663eb] font-medium hover:underline focus:outline-none"
          >
            Clear history
          </button>
        )}
      </div>
      <ul className="flex flex-col">
        {recentSearches.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between px-3 py-2 hover:bg-[#f2f5fa] rounded-md transition-colors cursor-pointer group"
          >
            <div
              onClick={() => onSelectRecent(item)}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <span className="text-sm text-[#707a8c]">🕒</span>
              <span className="text-sm text-[#171c29] truncate font-medium">
                {item}
              </span>
            </div>
            {onRemoveRecent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRecent(item);
                }}
                type="button"
                className="text-[#707a8c] hover:text-[#db2626] p-1 text-xs focus:outline-none"
                title="Remove search"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSearchesList;
