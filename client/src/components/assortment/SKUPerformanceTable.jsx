import React from "react";

const ACTION_COLORS = {
  GROW: "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]",
  MAINTAIN: "bg-[#e0f2fe] text-[#075985] border border-[#bae6fd]",
  REDUCE: "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]",
  SWAP: "bg-[#ffedd5] text-[#9a3412] border border-[#fed7aa]",
};

export default function SKUPerformanceTable({
  skuPerformance = [],
  skuActions = {},
  onActionChange,
  searchQuery = "",
}) {
  const filteredSKUs = skuPerformance.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.sku.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query)
    );
  });

  return (
    <div class="col-span-12 xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-outline-variant bg-surface flex justify-between items-center">
        <h3 class="font-title-sm text-title-sm text-on-surface">
          Snacks SKU Performance
        </h3>
        <span class="font-label-caps text-label-caps text-secondary flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">filter_list</span>
          Showing {filteredSKUs.length} of {skuPerformance.length} SKUs
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface border-b border-outline-variant font-label-caps text-label-caps text-on-secondary-container uppercase">
              <th class="px-cell-padding-x py-cell-padding-y font-bold">
                SKU ID
              </th>
              <th class="px-cell-padding-x py-cell-padding-y font-bold">
                Product Name
              </th>
              <th class="px-cell-padding-x py-cell-padding-y font-bold text-right">
                Sales YTD
              </th>
              <th class="px-cell-padding-x py-cell-padding-y font-bold text-right">
                Linear Ft
              </th>
              <th class="px-cell-padding-x py-cell-padding-y font-bold text-center">
                PB
              </th>
              <th class="px-cell-padding-x py-cell-padding-y font-bold text-right">
                In-Stock %
              </th>
              <th class="px-cell-padding-x py-cell-padding-y font-bold text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody class="font-data-tabular text-data-tabular text-on-surface">
            {filteredSKUs.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  class="px-cell-padding-x py-8 text-center text-secondary"
                >
                  No SKUs found matching "{searchQuery}"
                </td>
              </tr>
            ) : (
              filteredSKUs.map((item) => {
                const currentAction =
                  skuActions[item.sku] || item.recommended_action || "MAINTAIN";
                return (
                  <tr
                    key={item.sku}
                    class="border-b border-outline-variant hover:bg-surface transition-colors"
                  >
                    <td class="px-cell-padding-x py-cell-padding-y font-mono-label text-secondary">
                      {item.sku}
                    </td>
                    <td class="px-cell-padding-x py-cell-padding-y font-medium">
                      <div>{item.name}</div>
                      <div class="text-[11px] text-secondary">{item.brand}</div>
                    </td>
                    <td class="px-cell-padding-x py-cell-padding-y text-right">
                      ${item.sales ? item.sales.toLocaleString() : "0"}
                    </td>
                    <td class="px-cell-padding-x py-cell-padding-y text-right">
                      {item.linear_ft} ft
                    </td>
                    <td class="px-cell-padding-x py-cell-padding-y text-center">
                      {item.private_brand ? (
                        <span class="material-symbols-outlined text-[16px] text-tertiary">
                          check
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td class="px-cell-padding-x py-cell-padding-y text-right">
                      {item.in_stock_rate}%
                    </td>
                    <td class="px-cell-padding-x py-cell-padding-y text-center">
                      <select
                        value={currentAction}
                        onChange={(e) =>
                          onActionChange(item.sku, e.target.value)
                        }
                        class={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${
                          ACTION_COLORS[currentAction] || ACTION_COLORS.MAINTAIN
                        }`}
                      >
                        <option value="GROW">Grow</option>
                        <option value="MAINTAIN">Maintain</option>
                        <option value="REDUCE">Reduce</option>
                        <option value="SWAP">Swap</option>
                      </select>
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
}
