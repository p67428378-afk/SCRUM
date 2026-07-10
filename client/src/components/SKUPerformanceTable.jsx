import React from "react";

export default function SKUPerformanceTable({
  skus,
  total,
  page,
  perPage,
  onPageChange,
  onSearch,
  onSort,
  sortBy,
  sortOrder,
}) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "GROW":
        return "bg-[#16a34a] text-white";
      case "MAINTAIN":
        return "bg-[#2563eb] text-white";
      case "SWAP":
        return "bg-[#ea580c] text-white";
      case "REDUCE":
        return "bg-[#dc2626] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field)
      return (
        <span className="material-symbols-outlined text-[14px] ml-1 opacity-30">
          swap_vert
        </span>
      );
    return sortOrder === "asc" ? (
      <span className="material-symbols-outlined text-[14px] ml-1">
        arrow_upward
      </span>
    ) : (
      <span className="material-symbols-outlined text-[14px] ml-1">
        arrow_downward
      </span>
    );
  };

  return (
    <div className="bg-surface-container-lowest border border-surface-container-highest rounded flex flex-col h-full">
      <div className="p-md border-b border-surface-container-highest flex justify-between items-center bg-surface-bright/50">
        <h3 className="font-title-lg text-title-lg text-on-surface">
          SKU Performance
        </h3>
        <div className="flex gap-sm">
          <form onSubmit={handleSearchSubmit} className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              className="pl-[32px] pr-sm py-xs border border-surface-container-highest rounded bg-surface-container-lowest text-body-md focus:border-primary-container focus:ring-0 w-48 transition-colors"
              placeholder="Search SKUs..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <button className="p-xs border border-surface-container-highest rounded text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase sticky top-0">
            <tr>
              <th
                className="p-md border-b border-surface-container-highest font-medium cursor-pointer select-none"
                onClick={() => onSort("name")}
              >
                <div className="flex items-center">
                  SKU / ID {renderSortIcon("name")}
                </div>
              </th>
              <th
                className="p-md border-b border-surface-container-highest font-medium text-right cursor-pointer select-none"
                onClick={() => onSort("weekly_sales")}
              >
                <div className="flex items-center justify-end">
                  Weekly Sales {renderSortIcon("weekly_sales")}
                </div>
              </th>
              <th
                className="p-md border-b border-surface-container-highest font-medium text-right cursor-pointer select-none"
                onClick={() => onSort("profit_margin")}
              >
                <div className="flex items-center justify-end">
                  Margin {renderSortIcon("profit_margin")}
                </div>
              </th>
              <th className="p-md border-b border-surface-container-highest font-medium text-center">
                PB
              </th>
              <th className="p-md border-b border-surface-container-highest font-medium">
                Action Status
              </th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md divide-y divide-surface-container-highest">
            {skus.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-md text-center text-on-surface-variant"
                >
                  No SKUs found
                </td>
              </tr>
            ) : (
              skus.map((sku) => (
                <tr
                  key={sku.sku_id}
                  className="hover:bg-surface-container-low/50 transition-colors group"
                >
                  <td className="p-md">
                    <div className="font-title-md text-title-md text-on-surface">
                      {sku.name}
                    </div>
                    <div className="text-on-surface-variant font-label-sm text-label-sm font-mono">
                      {sku.sku_id}
                    </div>
                  </td>
                  <td className="p-md text-right font-medium">
                    ${sku.weekly_sales.toFixed(2)}
                  </td>
                  <td className="p-md text-right">{sku.profit_margin}%</td>
                  <td className="p-md text-center">
                    {sku.private_brand && (
                      <span className="material-symbols-outlined text-surface-variant text-[18px]">
                        check
                      </span>
                    )}
                  </td>
                  <td className="p-md">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm ${getStatusBadgeClass(sku.status)}`}
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
      <div className="p-sm border-t border-surface-container-highest flex justify-between items-center text-on-surface-variant font-body-md text-body-md bg-surface-bright/50">
        <span>
          Showing {Math.min(total, (page - 1) * perPage + 1)}-
          {Math.min(total, page * perPage)} of {total} SKUs
        </span>
        <div className="flex gap-xs">
          <button
            className="p-xs rounded hover:bg-surface-container-low disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
          </button>
          <button
            className="p-xs rounded hover:bg-surface-container-low disabled:opacity-50"
            disabled={page * perPage >= total}
            onClick={() => onPageChange(page + 1)}
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
