import React, { useState } from "react";
import PropTypes from "prop-types";

export default function SkuPerformanceTable({
  skus,
  selectedStatus,
  onStatusChange,
}) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const statuses = ["ALL", "GROW", "MAINTAIN", "SWAP", "REDUCE"];

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "GROW":
        return "bg-[#064E3B] text-[#10B981] border border-[#10B981]/30";
      case "MAINTAIN":
        return "bg-[#1E3A8A] text-[#60A5FA] border border-[#3B82F6]/30";
      case "SWAP":
        return "bg-[#78350F] text-[#F59E0B] border border-[#F59E0B]/30";
      case "REDUCE":
        return "bg-[#4C0519] text-[#F43F5E] border border-[#E11D48]/30";
      default:
        return "bg-surface-variant text-on-surface-variant border border-outline-variant";
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl shadow-sm flex flex-col overflow-hidden">
      <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low relative">
        <h2 className="font-headline-md text-on-surface font-semibold text-lg">
          SKU Performance
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="text-primary-fixed-dim hover:text-primary-fixed font-label-md flex items-center gap-xs transition-colors font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">
              filter_list
            </span>
            Filter: {selectedStatus || "All"}
          </button>

          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-surface-container-high border border-outline-variant rounded-lg shadow-lg z-50 py-1">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status === "ALL" ? "" : status);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-bright/10 transition-colors ${
                    (status === "ALL" && !selectedStatus) ||
                    selectedStatus === status
                      ? "text-primary-fixed-dim font-bold"
                      : "text-on-surface-variant"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container border-b border-outline-variant">
              <th className="py-sm px-md font-label-md text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                SKU ID
              </th>
              <th className="py-sm px-md font-label-md text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Name
              </th>
              <th className="py-sm px-md font-label-md text-on-surface-variant text-right text-xs font-semibold uppercase tracking-wider">
                Sales Perf.
              </th>
              <th className="py-sm px-md font-label-md text-on-surface-variant text-right text-xs font-semibold uppercase tracking-wider">
                Shelf Space
              </th>
              <th className="py-sm px-md font-label-md text-on-surface-variant text-center text-xs font-semibold uppercase tracking-wider">
                Private Brand
              </th>
              <th className="py-sm px-md font-label-md text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="font-body-sm">
            {skus.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-8 text-center text-on-surface-variant"
                >
                  No SKUs found matching the criteria.
                </td>
              </tr>
            ) : (
              skus.map((sku) => (
                <tr
                  key={sku.id}
                  className="border-b border-outline-variant hover:bg-[#2D3A4F] transition-colors group"
                >
                  <td className="py-2 px-md font-data-mono text-on-surface-variant text-xs">
                    #{sku.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td
                    className="py-2 px-md font-body-md text-on-surface font-medium truncate max-w-[200px]"
                    title={sku.name}
                  >
                    {sku.name}
                  </td>
                  <td className="py-2 px-md text-right text-on-surface font-data-mono">
                    $
                    {sku.sales_performance
                      ? sku.sales_performance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "0.00"}
                  </td>
                  <td className="py-2 px-md text-right text-on-surface-variant font-data-mono">
                    {sku.shelf_space ? `${sku.shelf_space.toFixed(1)} ft` : "-"}
                  </td>
                  <td className="py-2 px-md text-center">
                    {sku.private_brand ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-label-md bg-primary-container/15 text-primary-fixed border border-primary-container/30 font-semibold">
                        Yes
                      </span>
                    ) : (
                      <span className="text-on-surface-variant text-xs">-</span>
                    )}
                  </td>
                  <td className="py-2 px-md">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-bold ${getStatusBadgeClass(sku.status)}`}
                    >
                      {sku.status?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-sm px-md border-t border-outline-variant bg-surface-container flex justify-between items-center">
        <span className="font-body-sm text-on-surface-variant text-xs">
          Showing {skus.length} SKUs
        </span>
      </div>
    </div>
  );
}

SkuPerformanceTable.propTypes = {
  skus: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      sales_performance: PropTypes.number,
      shelf_space: PropTypes.number,
      private_brand: PropTypes.bool,
      status: PropTypes.string,
    }),
  ).isRequired,
  selectedStatus: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};
