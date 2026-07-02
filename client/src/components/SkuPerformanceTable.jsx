import React, { useState } from "react";
import {
  Search,
  Filter,
  Check,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function SkuPerformanceTable({ skus, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const filteredSkus =
    skus?.filter((sku) => {
      const matchesSearch =
        sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.sku_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        statusFilter === "ALL" || sku.recommendation_status === statusFilter;

      return matchesSearch && matchesFilter;
    }) || [];

  const getBadgeStyle = (status) => {
    switch (status) {
      case "GROW":
        return "bg-green-50 text-green-700 border-green-200";
      case "MAINTAIN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SWAP":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "REDUCE":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
      {/* Section Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            SKU Performance & Recommendations
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Current performance metrics and system-generated recommendations for
            Small Town Value Cluster.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search SKU, Brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dg-yellow focus:border-transparent w-full sm:w-60"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="GROW">GROW</option>
              <option value="MAINTAIN">MAINTAIN</option>
              <option value="SWAP">SWAP</option>
              <option value="REDUCE">REDUCE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">SKU Info</th>
              <th className="py-3.5 px-6">Brand</th>
              <th className="py-3.5 px-6 text-right">Weekly Sales</th>
              <th className="py-3.5 px-6 text-right">Sales Trend WoW</th>
              <th className="py-3.5 px-6 text-right">Profit Margin</th>
              <th className="py-3.5 px-6 text-right">Days of Supply</th>
              <th className="py-3.5 px-6 text-center">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredSkus.length > 0 ? (
              filteredSkus.map((sku) => (
                <tr
                  key={sku.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">
                      {sku.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 font-mono">
                        {sku.sku_id}
                      </span>
                      {sku.is_private_brand && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase tracking-wider">
                          Private Brand
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-medium">
                    {sku.brand}
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">
                    ${sku.weekly_sales?.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${sku.sales_trend_wow >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {sku.sales_trend_wow >= 0 ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      <span>{sku.sales_trend_wow}%</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-gray-700">
                    {sku.profit_margin}%
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-gray-700">
                    {sku.days_of_supply}d
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeStyle(sku.recommendation_status)}`}
                    >
                      {sku.recommendation_status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="py-12 text-center text-gray-500 font-medium"
                >
                  No SKUs found matching the search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
