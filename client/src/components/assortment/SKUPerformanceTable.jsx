import React from "react";

export default function SKUPerformanceTable({
  skus,
  total,
  page,
  limit,
  onPageChange,
}) {
  const getBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "GROW":
        return "badge-grow";
      case "MAINTAIN":
        return "badge-maintain";
      case "SWAP":
        return "badge-swap";
      case "REDUCE":
        return "badge-reduce";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <div className="lg:col-span-2 card-surface rounded-xl overflow-hidden flex flex-col">
      <div className="p-md border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
        <h2 className="font-headline-sm text-headline-sm text-white">
          Snacks SKU Performance &amp; Recommendations
        </h2>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700 font-label-caps text-label-caps text-slate-400 uppercase tracking-wider">
              <th className="p-4 font-semibold">SKU ID</th>
              <th className="p-4 font-semibold">Product Name</th>
              <th className="p-4 font-semibold">Brand Type</th>
              <th className="p-4 font-semibold text-right">Weekly Sales</th>
              <th className="p-4 font-semibold text-right">Margin %</th>
              <th className="p-4 font-semibold text-right">Shelf Space</th>
              <th className="p-4 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="font-data-tabular text-data-tabular divide-y divide-slate-800">
            {skus.map((sku) => (
              <tr
                key={sku.sku_id}
                className="hover:bg-slate-800/50 transition-colors border-l-2 border-transparent hover:border-emerald-500"
              >
                <td className="p-4 text-slate-300">{sku.sku_id}</td>
                <td className="p-4 text-white font-medium">
                  {sku.product_name}
                </td>
                <td className="p-4 text-slate-400">{sku.brand_type}</td>
                <td className="p-4 text-right text-slate-200">
                  {formatCurrency(sku.weekly_sales)}
                </td>
                <td className="p-4 text-right text-emerald-400">
                  {sku.margin_percent}%
                </td>
                <td className="p-4 text-right text-slate-400">
                  {sku.shelf_space}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold uppercase ${getBadgeClass(sku.status)}`}
                  >
                    {sku.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-between items-center text-slate-400 font-mono-label text-mono-label">
        <span>
          Showing {skus.length} of {total} SKUs
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-2 py-1 rounded hover:bg-slate-800 disabled:opacity-50"
          >
            &lt;
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page * limit >= total}
            className="px-2 py-1 rounded hover:bg-slate-800 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
