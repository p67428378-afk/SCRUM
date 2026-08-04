import React, { useState } from "react";
import { Search, Plus, Edit2, Package } from "lucide-react";

const ItemCatalogTable = ({ items = [], loading = false, onOpenDrawer }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) => {
    const sku = item.sku || "";
    const name = item.name || "";
    const term = searchTerm.toLowerCase();
    return (
      sku.toLowerCase().includes(term) || name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Item Catalog</h3>
          <p className="text-xs text-slate-400">
            Manage SKUs, unit pricing, reorder thresholds, and reorder
            quantities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Catalog..."
              className="bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => onOpenDrawer && onOpenDrawer(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/60 text-slate-400 border-b border-slate-700/60">
            <tr>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Item Name</th>
              <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
              <th className="px-4 py-3 font-semibold text-right">
                Reorder Threshold
              </th>
              <th className="px-4 py-3 font-semibold text-right">
                Reorder Quantity
              </th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Loading catalog items...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  No items configured in catalog.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-400">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-100 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500" />
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-200">
                    ${Number(item.unit_price || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {item.reorder_threshold} units
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {item.reorder_quantity} units
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onOpenDrawer && onOpenDrawer(item)}
                      className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemCatalogTable;
