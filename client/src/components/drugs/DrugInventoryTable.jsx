import React from "react";
import { Edit2, Trash2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export const DrugInventoryTable = ({
  drugs = [],
  isLoading = false,
  onEdit = () => {},
  onDelete = () => {},
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
        <p className="text-sm font-medium text-slate-500">
          Loading drug inventory...
        </p>
      </div>
    );
  }

  if (drugs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          No drugs found
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No inventory records match your criteria. Try adjusting your search or
          add a new drug entry.
        </p>
      </div>
    );
  }

  // Calculate if a date string is within 30 days
  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const expiry = new Date(dateString);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Drug Details</th>
              <th className="py-3.5 px-4">Dosage</th>
              <th className="py-3.5 px-4">Manufacturer / Batch</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-right">Stock</th>
              <th className="py-3.5 px-4">Expiration Date</th>
              <th className="py-3.5 px-4 text-right">Unit Price</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {drugs.map((drug) => {
              const lowStock = drug.is_low_stock ?? drug.stock_quantity < 50;
              const nearExpiry =
                drug.is_near_expiry ?? isExpiringSoon(drug.expiration_date);

              return (
                <tr
                  key={drug.id}
                  className="hover:bg-slate-50/60 transition group"
                >
                  {/* Name & Generic Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {drug.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {drug.generic_name || "N/A"}
                    </div>
                  </td>

                  {/* Dosage */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                    {drug.dosage}
                  </td>

                  {/* Manufacturer & Batch */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 font-medium">
                      {drug.manufacturer}
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      {drug.batch_number}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {drug.category || "General"}
                    </span>
                  </td>

                  {/* Stock Quantity */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`font-bold ${
                        lowStock ? "text-amber-600" : "text-slate-900"
                      }`}
                    >
                      {drug.stock_quantity}
                    </span>
                  </td>

                  {/* Expiration Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-xs font-semibold ${
                        nearExpiry
                          ? "text-rose-600 font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      {drug.expiration_date}
                    </span>
                  </td>

                  {/* Unit Price */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                    ${Number(drug.unit_price || 0).toFixed(2)}
                  </td>

                  {/* Status Badges */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {lowStock && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 mr-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Low Stock</span>
                      </span>
                    )}
                    {nearExpiry && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800">
                        <Clock className="w-3 h-3" />
                        <span>Near Expiry</span>
                      </span>
                    )}
                    {!lowStock && !nearExpiry && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Normal</span>
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onEdit(drug)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Drug Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(drug)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Drug Record"
                      >
                        <Trash2 className="w-4 h-4" />
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

export default DrugInventoryTable;
