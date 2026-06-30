import React from "react";

export default function SkuPerformanceTable({
  skus,
  loading,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
}) {
  const getRecBadgeClass = (status) => {
    switch (status) {
      case "GROW":
        return "bg-primary/10 text-primary border border-primary/20";
      case "MAINTAIN":
        return "bg-surface-bright text-on-surface border border-outline-variant";
      case "SWAP":
        return "bg-secondary-container/10 text-secondary-container border border-secondary-container/20";
      case "REDUCE":
        return "bg-error/10 text-error border border-error/20";
      default:
        return "bg-surface-bright text-on-surface border border-outline-variant";
    }
  };

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden flex-1 flex flex-col">
      <div className="p-4 border-b border-[#334155] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          SKU Performance
        </h3>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="status-filter"
              className="text-xs text-[#94A3B8] font-data-label uppercase"
            >
              Filter:
            </label>
            <select
              id="status-filter"
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="bg-[#162033] border border-[#334155] text-on-surface text-xs rounded px-2 py-1 focus:outline-none focus:border-primary"
            >
              <option value="">All Recommendations</option>
              <option value="GROW">GROW</option>
              <option value="MAINTAIN">MAINTAIN</option>
              <option value="SWAP">SWAP</option>
              <option value="REDUCE">REDUCE</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-by"
              className="text-xs text-[#94A3B8] font-data-label uppercase"
            >
              Sort:
            </label>
            <select
              id="sort-by"
              value={sortBy || ""}
              onChange={(e) => setSortBy(e.target.value || null)}
              className="bg-[#162033] border border-[#334155] text-on-surface text-xs rounded px-2 py-1 focus:outline-none focus:border-primary"
            >
              <option value="">Default</option>
              <option value="sales_revenue">Sales Revenue</option>
              <option value="units_sold">Units Sold</option>
              <option value="profit_margin">Profit Margin</option>
            </select>
          </div>

          <button className="text-primary font-data-label text-data-label flex items-center gap-1 ml-auto sm:ml-0 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-sm">download</span>{" "}
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#162033] border-b border-[#334155]">
              <th className="p-3 font-data-label text-data-label text-[#94A3B8] font-normal uppercase whitespace-nowrap">
                SKU
              </th>
              <th className="p-3 font-data-label text-data-label text-[#94A3B8] font-normal uppercase">
                Product Name
              </th>
              <th className="p-3 font-data-label text-data-label text-[#94A3B8] font-normal uppercase text-right">
                Sales ($)
              </th>
              <th className="p-3 font-data-label text-data-label text-[#94A3B8] font-normal uppercase text-right">
                Unit Mvmt
              </th>
              <th className="p-3 font-data-label text-data-label text-[#94A3B8] font-normal uppercase text-right">
                Margin %
              </th>
              <th className="p-3 font-data-label text-data-label text-[#94A3B8] font-normal uppercase text-center">
                Rec
              </th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-on-surface-variant"
                >
                  Loading SKU performance data...
                </td>
              </tr>
            ) : skus.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-on-surface-variant"
                >
                  No SKUs found matching the criteria.
                </td>
              </tr>
            ) : (
              skus.map((sku, idx) => (
                <tr
                  key={sku.sku}
                  className={`border-b border-[#334155] hover:bg-[#283044]/50 transition-colors ${
                    idx % 2 === 1 ? "bg-[#162033]" : ""
                  }`}
                >
                  <td className="p-3 text-on-surface-variant font-data-label">
                    {sku.sku}
                  </td>
                  <td className="p-3 text-on-surface">{sku.product_name}</td>
                  <td className="p-3 text-on-surface font-data-label text-right">
                    $
                    {sku.sales_revenue.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="p-3 text-on-surface font-data-label text-right">
                    {sku.units_sold.toLocaleString()}
                  </td>
                  <td className="p-3 text-on-surface font-data-label text-right">
                    {sku.profit_margin.toFixed(1)}%
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getRecBadgeClass(sku.recommendation_status)}`}
                    >
                      {sku.recommendation_status}
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
