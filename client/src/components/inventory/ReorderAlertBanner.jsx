import React from "react";
import { AlertTriangle, ArrowUpRight } from "lucide-react";

export default function ReorderAlertBanner({ alertTeas = [], onRestockClick }) {
  if (!alertTeas || alertTeas.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900">
              Low Stock Reorder Alert ({alertTeas.length}{" "}
              {alertTeas.length === 1 ? "tea" : "teas"} below threshold)
            </h3>
            <div className="mt-1 text-sm text-amber-800 space-y-1">
              {alertTeas.map((tea) => (
                <div
                  key={tea.id || tea.name}
                  className="flex items-center space-x-2"
                >
                  <span className="font-medium text-amber-950">
                    {tea.name}:
                  </span>
                  <span className="font-bold text-red-700">
                    {tea.current_stock_grams}g
                  </span>
                  <span className="text-amber-700">
                    (Threshold: {tea.min_threshold_grams || 500}g)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {onRestockClick && (
          <button
            onClick={onRestockClick}
            className="flex items-center px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition"
          >
            Quick Restock <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
