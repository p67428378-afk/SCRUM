import React, { useState } from "react";
import Badge from "../common/Badge.jsx";

export default function SKUPerformanceTable({ skus, loading }) {
  const [sortField, setSortField] = useState("sku");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  if (loading || !skus) {
    return (
      <div className="bg-white rounded-DEFAULT border border-surface-variant shadow-ambient flex flex-col overflow-hidden animate-pulse">
        <div className="px-lg py-md border-b border-surface-variant h-16 bg-surface-bright"></div>
        <div className="h-64 bg-gray-100"></div>
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredSkus = skus.filter(
    (sku) =>
      sku.name.toLowerCase().includes(filterText.toLowerCase()) ||
      sku.sku.toLowerCase().includes(filterText.toLowerCase()),
  );

  const sortedSkus = [...filteredSkus].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string") {
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortDirection === "asc" ? valA - valB : valB - valA;
    }
  });

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <span className="material-symbols-outlined text-[14px] opacity-30 group-hover:opacity-100">
          swap_vert
        </span>
      );
    }
    return sortDirection === "asc" ? (
      <span className="material-symbols-outlined text-[14px] text-dg-blue">
        arrow_upward
      </span>
    ) : (
      <span className="material-symbols-outlined text-[14px] text-dg-blue">
        arrow_downward
      </span>
    );
  };

  return (
    <div className="bg-white rounded-DEFAULT border border-surface-variant shadow-ambient flex flex-col overflow-hidden">
      <div className="px-lg py-md border-b border-surface-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-bright">
        <h2 className="font-headline-sm text-on-surface">
          Snacks SKU Performance
        </h2>
        <div className="flex gap-sm w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search SKUs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 border border-surface-variant rounded-DEFAULT text-body-sm focus:outline-none focus:border-dg-blue"
            />
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
          </div>
          <button className="p-2 border border-surface-variant rounded-DEFAULT hover:bg-surface-container-low transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">
              filter_list
            </span>
          </button>
          <button className="p-2 border border-surface-variant rounded-DEFAULT hover:bg-surface-container-low transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">download</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-surface-variant">
              <th
                onClick={() => handleSort("sku")}
                className="py-3 px-md font-label-md text-on-surface-variant cursor-pointer hover:bg-surface-variant/50 transition-colors group"
              >
                <div className="flex items-center gap-1">
                  SKU ID {renderSortIcon("sku")}
                </div>
              </th>
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-md font-label-md text-on-surface-variant cursor-pointer hover:bg-surface-variant/50 transition-colors group"
              >
                <div className="flex items-center gap-1">
                  Product Name {renderSortIcon("name")}
                </div>
              </th>
              <th
                onClick={() => handleSort("sales")}
                className="py-3 px-md font-label-md text-on-surface-variant cursor-pointer hover:bg-surface-variant/50 transition-colors text-right group"
              >
                <div className="flex items-center justify-end gap-1">
                  Sales {renderSortIcon("sales")}
                </div>
              </th>
              <th
                onClick={() => handleSort("units")}
                className="py-3 px-md font-label-md text-on-surface-variant cursor-pointer hover:bg-surface-variant/50 transition-colors text-right group"
              >
                <div className="flex items-center justify-end gap-1">
                  Units {renderSortIcon("units")}
                </div>
              </th>
              <th
                onClick={() => handleSort("margin")}
                className="py-3 px-md font-label-md text-on-surface-variant cursor-pointer hover:bg-surface-variant/50 transition-colors text-right group"
              >
                <div className="flex items-center justify-end gap-1">
                  Margin {renderSortIcon("margin")}
                </div>
              </th>
              <th
                onClick={() => handleSort("days_of_supply")}
                className="py-3 px-md font-label-md text-on-surface-variant cursor-pointer hover:bg-surface-variant/50 transition-colors text-right group"
              >
                <div className="flex items-center justify-end gap-1">
                  DOS {renderSortIcon("days_of_supply")}
                </div>
              </th>
              <th className="py-3 px-md font-label-md text-on-surface-variant">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant">
            {sortedSkus.map((sku, index) => (
              <tr
                key={sku.sku}
                className={`hover:bg-surface-bright transition-colors ${
                  index % 2 === 1 ? "bg-surface-bright" : ""
                }`}
              >
                <td className="py-3 px-md font-data-mono text-on-surface-variant">
                  {sku.sku}
                </td>
                <td className="py-3 px-md font-body-md text-on-surface">
                  <div className="flex items-center gap-1">
                    <span
                      className={
                        sku.private_brand ? "font-medium text-dg-blue" : ""
                      }
                    >
                      {sku.name}
                    </span>
                    {sku.private_brand && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-dg-blue text-white text-[9px] uppercase font-bold tracking-wider">
                        PB
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-md font-data-mono text-on-surface text-right">
                  ${sku.sales.toLocaleString()}
                </td>
                <td className="py-3 px-md font-data-mono text-on-surface text-right">
                  {sku.units.toLocaleString()}
                </td>
                <td className="py-3 px-md font-data-mono text-on-surface text-right">
                  {Math.round(sku.margin * 100)}%
                </td>
                <td className="py-3 px-md font-data-mono text-on-surface text-right">
                  {sku.days_of_supply}
                </td>
                <td className="py-3 px-md">
                  <Badge status={sku.status} />
                </td>
              </tr>
            ))}
            {sortedSkus.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-on-surface-variant font-body-md"
                >
                  No SKUs found matching search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
