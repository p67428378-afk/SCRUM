import React, { useState } from "react";
import { Filter, MoreVertical } from "lucide-react";

export default function SKUPerformanceSection({ skus }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (!skus || skus.length === 0) {
    return (
      <div className="bg-surface-container rounded-lg border border-surface-bright p-md text-center text-on-surface-variant">
        No SKU data available.
      </div>
    );
  }

  const totalPages = Math.ceil(skus.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSKUs = skus.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "GROW":
        return (
          <span className="inline-block bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-800/50">
            GROW
          </span>
        );
      case "MAINTAIN":
        return (
          <span className="inline-block bg-blue-900/40 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-800/50">
            MAINTAIN
          </span>
        );
      case "SWAP":
        return (
          <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold border border-primary/30">
            SWAP
          </span>
        );
      case "REDUCE":
        return (
          <span className="inline-block bg-red-900/40 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-800/50">
            REDUCE
          </span>
        );
      default:
        return (
          <span className="inline-block bg-surface-bright text-on-surface px-2 py-1 rounded text-xs font-bold border border-outline">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface-container rounded-lg border border-surface-bright overflow-hidden flex flex-col">
      <div className="p-md border-b border-surface-bright flex justify-between items-center bg-surface-container">
        <h3 className="font-headline-md text-headline-md text-on-surface text-base">
          Assortment SKU List (Snacks)
        </h3>
        <div className="flex gap-sm">
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-surface-bright bg-surface-container-low">
              <th className="p-sm font-label-caps text-label-caps text-on-surface-variant uppercase">
                SKU
              </th>
              <th className="p-sm font-label-caps text-label-caps text-on-surface-variant uppercase">
                Product Name
              </th>
              <th className="p-sm font-label-caps text-label-caps text-on-surface-variant uppercase text-right">
                Sales
              </th>
              <th className="p-sm font-label-caps text-label-caps text-on-surface-variant uppercase text-right">
                Units
              </th>
              <th className="p-sm font-label-caps text-label-caps text-on-surface-variant uppercase text-right">
                Profit
              </th>
              <th className="p-sm font-label-caps text-label-caps text-on-surface-variant uppercase text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="font-data-mono text-data-mono text-on-surface">
            {paginatedSKUs.map((skuItem) => (
              <tr
                key={skuItem.sku}
                className="table-row-hover border-b border-surface-bright/50 transition-colors"
              >
                <td className="p-sm">{skuItem.sku}</td>
                <td
                  className="p-sm font-body-md truncate max-w-[200px]"
                  title={skuItem.name}
                >
                  {skuItem.name}
                </td>
                <td className="p-sm text-right">
                  ${skuItem.sales?.toLocaleString()}
                </td>
                <td className="p-sm text-right">
                  {skuItem.units?.toLocaleString()}
                </td>
                <td className="p-sm text-right">
                  ${skuItem.profit?.toLocaleString()}
                </td>
                <td className="p-sm text-center">
                  {getStatusBadge(skuItem.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-sm border-t border-surface-bright bg-surface-container-low flex justify-between items-center text-xs text-on-surface-variant mt-auto">
        <span>
          Showing {startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, skus.length)} of {skus.length}{" "}
          SKUs
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border border-surface-bright rounded hover:bg-surface-bright disabled:opacity-50"
          >
            &lt;
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-2 py-1 border border-surface-bright rounded hover:bg-surface-bright disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
