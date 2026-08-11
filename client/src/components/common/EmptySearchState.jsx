import React from "react";

export const EmptySearchState = ({ query, onClear }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-3">
      <div className="text-3xl">🔍</div>
      <p className="font-bold text-[#171c29] text-base">
        No products found for '{query}'
      </p>
      <p className="text-sm text-[#707a8c]">
        Try checking for typos or searching for a broader term.
      </p>
      {onClear && (
        <button
          onClick={onClear}
          type="button"
          className="bg-[#2663eb] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#1d4ed8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2663eb] focus:ring-offset-2"
        >
          Clear search
        </button>
      )}
    </div>
  );
};

export default EmptySearchState;
