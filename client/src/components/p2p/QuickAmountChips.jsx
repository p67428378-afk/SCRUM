import React from "react";

export default function QuickAmountChips({ selectedAmount, onSelectAmount }) {
  const chipValues = [50, 100, 250, 500, 1000];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {chipValues.map((val) => {
        const isSelected = parseFloat(selectedAmount) === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onSelectAmount(val.toString())}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              isSelected
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            ${val}
          </button>
        );
      })}
    </div>
  );
}
