import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  RefreshCw,
  Archive,
} from "lucide-react";

export const AlertsTable = ({
  alerts = [],
  isLoading = false,
  onRestock = () => {},
  onQuarantine = () => {},
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-2"></div>
        <p className="text-sm font-medium text-slate-500">
          Checking stock & expiration alerts...
        </p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-10 text-center shadow-sm">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-emerald-900">
          All Stock Levels & Expirations Normal
        </h3>
        <p className="text-sm text-emerald-700 max-w-md mx-auto mt-1">
          No inventory items currently require urgent attention. All stock
          quantities are above 50 units and expiration dates are beyond 30 days.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-sm">
            Active Inventory Warnings ({alerts.length})
          </span>
        </div>
        <span className="text-xs text-amber-700 font-medium">
          Requires immediate review or purchase order creation
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Alert Reason</th>
              <th className="py-3 px-4">Drug Name</th>
              <th className="py-3 px-4">Batch No.</th>
              <th className="py-3 px-4 text-right">Current Stock</th>
              <th className="py-3 px-4">Expiration Date</th>
              <th className="py-3 px-4 text-center">Urgency</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {alerts.map((item) => {
              const isLow = item.is_low_stock || item.stock_quantity < 50;
              const isNearExpiry = item.is_near_expiry;

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  {/* Alert Reason */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {isLow && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Low Stock (&lt; 50 units)</span>
                        </span>
                      )}
                      {isNearExpiry && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800">
                          <Clock className="w-3.5 h-3.5 text-rose-600" />
                          <span>Near Expiry (&lt; 30 days)</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Drug Name & Dosage */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div>{item.name}</div>
                    <div className="text-xs text-slate-500 font-normal">
                      {item.dosage}
                    </div>
                  </td>

                  {/* Batch Number */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    {item.batch_number}
                  </td>

                  {/* Current Stock */}
                  <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                    {item.stock_quantity} units
                  </td>

                  {/* Expiration Date */}
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {item.expiration_date}
                  </td>

                  {/* Urgency Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full ${
                        item.stock_quantity < 15 || isNearExpiry
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {item.stock_quantity < 15 || isNearExpiry
                        ? "High"
                        : "Medium"}
                    </span>
                  </td>

                  {/* Action Triggers */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onRestock(item)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                      <button
                        onClick={() => onQuarantine(item)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Quarantine</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTable;
