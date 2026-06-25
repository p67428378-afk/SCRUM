import React, { useState, useMemo } from "react";

export default function SKUPerformanceSection({ skus }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("sku_id");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedSKUs = useMemo(() => {
    if (!skus) return [];

    // Filter
    let result = skus.filter((sku) => {
      const term = searchTerm.toLowerCase();
      return (
        sku.sku_id?.toLowerCase().includes(term) ||
        sku.product_name?.toLowerCase().includes(term) ||
        sku.status?.toLowerCase().includes(term)
      );
    });

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [skus, searchTerm, sortField, sortDirection]);

  const getStatusBadgeClass = (status) => {
    const s = status?.toUpperCase();
    if (s === "GROW") return "bg-status-grow-bg text-status-grow-text";
    if (s === "MAINTAIN")
      return "bg-status-maintain-bg text-status-maintain-text";
    if (s === "SWAP") return "bg-status-swap-bg text-status-swap-text";
    if (s === "REDUCE") return "bg-status-reduce-bg text-status-reduce-text";
    return "bg-surface-container text-secondary";
  };

  const getProductInitials = (name) => {
    if (!name) return "DG";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="lg:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-surface-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-bright">
        <h2 className="text-headline-md font-headline-md text-on-surface">
          SKU Performance
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary/50 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search SKUs..."
              className="pl-10 pr-4 py-2 border border-surface-variant rounded-md text-body-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="p-2 text-secondary hover:bg-surface-container rounded-md transition-colors border border-surface-variant bg-surface-container-lowest"
            title="Filter"
          >
            <span className="material-symbols-outlined text-[20px]">
              filter_list
            </span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-surface-variant bg-surface-container-lowest text-label-caps font-label-caps text-secondary select-none">
              <th
                className="p-4 font-semibold w-28 cursor-pointer hover:text-on-surface"
                onClick={() => handleSort("sku_id")}
              >
                <div className="flex items-center gap-1">
                  SKU ID
                  {sortField === "sku_id" && (
                    <span className="material-symbols-outlined text-[16px]">
                      {sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="p-4 font-semibold cursor-pointer hover:text-on-surface"
                onClick={() => handleSort("product_name")}
              >
                <div className="flex items-center gap-1">
                  Product
                  {sortField === "product_name" && (
                    <span className="material-symbols-outlined text-[16px]">
                      {sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="p-4 font-semibold text-right cursor-pointer hover:text-on-surface"
                onClick={() => handleSort("sales_ytd")}
              >
                <div className="flex items-center justify-end gap-1">
                  Sales YTD
                  {sortField === "sales_ytd" && (
                    <span className="material-symbols-outlined text-[16px]">
                      {sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="p-4 font-semibold text-right cursor-pointer hover:text-on-surface"
                onClick={() => handleSort("units_sold")}
              >
                <div className="flex items-center justify-end gap-1">
                  Units
                  {sortField === "units_sold" && (
                    <span className="material-symbols-outlined text-[16px]">
                      {sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="p-4 font-semibold text-right cursor-pointer hover:text-on-surface"
                onClick={() => handleSort("profit_margin")}
              >
                <div className="flex items-center justify-end gap-1">
                  Margin
                  {sortField === "profit_margin" && (
                    <span className="material-symbols-outlined text-[16px]">
                      {sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="p-4 font-semibold text-center cursor-pointer hover:text-on-surface"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center justify-center gap-1">
                  Status
                  {sortField === "status" && (
                    <span className="material-symbols-outlined text-[16px]">
                      {sortDirection === "asc"
                        ? "arrow_upward"
                        : "arrow_downward"}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="text-body-sm divide-y divide-surface-variant">
            {filteredAndSortedSKUs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-secondary">
                  No SKUs found matching your search.
                </td>
              </tr>
            ) : (
              filteredAndSortedSKUs.map((sku, index) => (
                <tr
                  key={sku.sku_id}
                  className={`hover:bg-surface-container/30 transition-colors group ${index % 2 === 1 ? "bg-secondary/5" : ""}`}
                >
                  <td className="p-4 font-data-mono text-secondary">
                    {sku.sku_id}
                  </td>
                  <td className="p-4 font-medium text-on-surface flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-secondary/50 font-label-caps text-[10px]">
                      {getProductInitials(sku.product_name)}
                    </div>
                    {sku.product_name}
                  </td>
                  <td className="p-4 font-data-mono text-right">
                    $
                    {sku.sales_ytd?.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4 font-data-mono text-right">
                    {sku.units_sold?.toLocaleString()}
                  </td>
                  <td className="p-4 font-data-mono text-right text-status-grow-text font-medium">
                    {sku.profit_margin}%
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${getStatusBadgeClass(sku.status)}`}
                    >
                      {sku.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
