import React, { useState } from "react";
import { Search, AlertTriangle, ArrowUpDown, PlusCircle } from "lucide-react";

const InventoryTable = ({
  inventory = [],
  loading = false,
  onOpenAdjustModal,
  onOpenItemDrawer,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInventory = inventory.filter((item) => {
    const sku = item.sku || "";
    const name = item.item_name || item.name || "";
    const warehouse = item.warehouse_name || "";
    const term = searchTerm.toLowerCase();
    return (
      sku.toLowerCase().includes(term) ||
      name.toLowerCase().includes(term) ||
      warehouse.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Stock Visibility Table
          </h3>
          <p className="text-xs text-slate-400">
            Real-time stock quantities across all inventory items and locations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter inventory..."
              className="bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          {onOpenItemDrawer && (
            <button
              onClick={() => onOpenItemDrawer()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-500 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add Item
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/60 text-slate-400 border-b border-slate-700/60">
            <tr>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Item Name</th>
              <th className="px-4 py-3 font-semibold">Warehouse</th>
              <th className="px-4 py-3 font-semibold text-right">
                Quantity On Hand
              </th>
              <th className="px-4 py-3 font-semibold text-right">
                Reorder Threshold
              </th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">
                  Loading real-time stock levels...
                </td>
              </tr>
            ) : filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">
                  No stock records found.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item, idx) => {
                const isLow = item.quantity_on_hand <= item.reorder_threshold;
                return (
                  <tr
                    key={item.id || item.item_id || idx}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-400">
                      {item.sku}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-100">
                      {item.item_name || item.name || "Unnamed Item"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.warehouse_name || "Central Warehouse"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-100">
                      {item.quantity_on_hand}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {item.reorder_threshold}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          onOpenAdjustModal && onOpenAdjustModal(item)
                        }
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 rounded border border-slate-600 transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
