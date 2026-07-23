import React, { useState } from "react";

export default function SKUPerformanceTable({
  skus,
  loading,
  error,
  onSearch,
  onSort,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("product_name");
  const [order, setOrder] = useState("asc");

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && order === "asc" ? "desc" : "asc";
    setSortBy(field);
    setOrder(newOrder);
    if (onSort) {
      onSort(field, newOrder);
    }
  };

  // Local filtering/sorting as fallback
  const filteredSKUs = (skus || []).filter(
    (sku) =>
      sku.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.sku_id?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedSKUs = [...filteredSKUs].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === "string") {
      return order === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return order === "asc"
      ? (valA || 0) - (valB || 0)
      : (valB || 0) - (valA || 0);
  });

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "GROW":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400">
            GROW
          </span>
        );
      case "MAINTAIN":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-surface-container-highest text-on-surface-variant border border-outline-variant">
            MAINTAIN
          </span>
        );
      case "SWAP":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-secondary/15 text-secondary">
            SWAP
          </span>
        );
      case "REDUCE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/15 text-rose-400">
            REDUCE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-surface-container-highest text-on-surface-variant">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl flex flex-col overflow-hidden h-[400px]">
      <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          Snacks SKU Performance
        </h3>
        <div className="flex gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              className="bg-surface-container-highest border border-outline-variant rounded-md pl-8 pr-3 py-1.5 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-48"
              placeholder="Search SKUs..."
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button
            className="p-1.5 border border-outline-variant rounded-md hover:bg-surface-container-high transition-colors text-on-surface-variant"
            onClick={() => handleSort("weekly_sales")}
            title="Sort by Weekly Sales"
          >
            <span className="material-symbols-outlined">sort</span>
          </button>
        </div>
      </div>
      <div className="overflow-auto flex-1 custom-scrollbar relative">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant animate-pulse">
            Loading SKU performance data...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-error">
            Failed to load SKU performance data.
          </div>
        ) : sortedSKUs.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            No SKUs found matching search criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-container-high border-b border-outline-variant z-10">
              <tr>
                <th
                  className="p-3 font-label-md text-label-md text-on-surface-variant uppercase cursor-pointer hover:text-on-surface"
                  onClick={() => handleSort("product_name")}
                >
                  Product Name{" "}
                  {sortBy === "product_name" && (order === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-3 font-label-md text-label-md text-on-surface-variant uppercase cursor-pointer hover:text-on-surface"
                  onClick={() => handleSort("sku_id")}
                >
                  SKU ID {sortBy === "sku_id" && (order === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-3 font-label-md text-label-md text-on-surface-variant uppercase text-right cursor-pointer hover:text-on-surface"
                  onClick={() => handleSort("weekly_sales")}
                >
                  Weekly Sales{" "}
                  {sortBy === "weekly_sales" && (order === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-3 font-label-md text-label-md text-on-surface-variant uppercase text-right cursor-pointer hover:text-on-surface"
                  onClick={() => handleSort("profit_margin")}
                >
                  Profit Margin{" "}
                  {sortBy === "profit_margin" && (order === "asc" ? "▲" : "▼")}
                </th>
                <th
                  className="p-3 font-label-md text-label-md text-on-surface-variant uppercase text-center cursor-pointer hover:text-on-surface"
                  onClick={() => handleSort("status")}
                >
                  Status {sortBy === "status" && (order === "asc" ? "▲" : "▼")}
                </th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-data-mono text-on-surface divide-y divide-outline-variant/50">
              {sortedSKUs.map((sku) => (
                <tr
                  key={sku.id}
                  className="hover:bg-surface-container/50 transition-colors group"
                >
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface-container-highest border border-outline-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        fastfood
                      </span>
                    </div>
                    {sku.product_name}
                  </td>
                  <td className="p-3 text-on-surface-variant">{sku.sku_id}</td>
                  <td className="p-3 text-right">
                    ${sku.weekly_sales?.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-400">
                    {(sku.profit_margin * 100).toFixed(0)}%
                  </td>
                  <td className="p-3 text-center">
                    {getStatusBadge(sku.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
