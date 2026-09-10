import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  RefreshCw,
  MinusCircle,
  TrendingDown,
  Tag,
  CheckCircle2,
  Package,
} from "lucide-react";

export default function SKUPerformanceTable({
  skus = [],
  counts = {
    grow_count: 0,
    maintain_count: 0,
    swap_count: 0,
    reduce_count: 0,
    total: 0,
  },
  loading = false,
  error = null,
  onRefresh = () => {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBadge, setSelectedBadge] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [sortField, setSortField] = useState("sales_per_linear_ft");
  const [sortAsc, setSortAsc] = useState(false);

  // Sub-categories list
  const subCategories = useMemo(() => {
    const set = new Set(skus.map((s) => s.sub_category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [skus]);

  // Filtered and Sorted SKUs
  const filteredSKUs = useMemo(() => {
    return skus
      .filter((sku) => {
        const matchesSearch =
          !searchTerm ||
          sku.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sku.sku_code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "ALL" || sku.sub_category === selectedCategory;
        const matchesBadge =
          selectedBadge === "ALL" ||
          sku.action_badge?.toUpperCase() === selectedBadge;
        const matchesBrand =
          selectedBrand === "ALL" || sku.brand_type === selectedBrand;

        return matchesSearch && matchesCategory && matchesBadge && matchesBrand;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string") {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? (valA ?? 0) - (valB ?? 0) : (valB ?? 0) - (valA ?? 0);
      });
  }, [
    skus,
    searchTerm,
    selectedCategory,
    selectedBadge,
    selectedBrand,
    sortField,
    sortAsc,
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const renderBadge = (badge) => {
    const b = (badge || "").toUpperCase();
    switch (b) {
      case "GROW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            GROW
          </span>
        );
      case "MAINTAIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            MAINTAIN
          </span>
        );
      case "SWAP":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <RefreshCw className="w-3 h-3 text-amber-600" />
            SWAP
          </span>
        );
      case "REDUCE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <TrendingDown className="w-3 h-3 text-red-600" />
            REDUCE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
            {badge || "N/A"}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
      {/* Table Section Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Snacks Category SKU Performance & Actions
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assortment recommendations tailored for Small Town Value Cluster
              store profiles
            </p>
          </div>

          {/* Action Summary Pill Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedBadge("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedBadge === "ALL"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              All SKUs ({counts.total ?? skus.length})
            </button>
            <button
              onClick={() =>
                setSelectedBadge(selectedBadge === "GROW" ? "ALL" : "GROW")
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedBadge === "GROW"
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Grow: {counts.grow_count ?? 0}
            </button>
            <button
              onClick={() =>
                setSelectedBadge(
                  selectedBadge === "MAINTAIN" ? "ALL" : "MAINTAIN",
                )
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedBadge === "MAINTAIN"
                  ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                  : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Maintain: {counts.maintain_count ?? 0}
            </button>
            <button
              onClick={() =>
                setSelectedBadge(selectedBadge === "SWAP" ? "ALL" : "SWAP")
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedBadge === "SWAP"
                  ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              Swap: {counts.swap_count ?? 0}
            </button>
            <button
              onClick={() =>
                setSelectedBadge(selectedBadge === "REDUCE" ? "ALL" : "REDUCE")
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                selectedBadge === "REDUCE"
                  ? "bg-red-600 text-white border-red-700 shadow-sm"
                  : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              Reduce: {counts.reduce_count ?? 0}
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product or SKU code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ECC000] focus:border-transparent text-slate-800"
            />
          </div>

          {/* Sub-Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ECC000] text-slate-800"
            >
              {subCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? "All Sub-Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Brand:
            </span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ECC000] text-slate-800"
            >
              <option value="ALL">All Brands</option>
              <option value="Private Brand">
                Private Brand (Clover Valley / DG)
              </option>
              <option value="National Brand">National Brand</option>
            </select>
          </div>

          {/* Action Badge Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Action:
            </span>
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ECC000] text-slate-800"
            >
              <option value="ALL">All Actions</option>
              <option value="GROW">GROW</option>
              <option value="MAINTAIN">MAINTAIN</option>
              <option value="SWAP">SWAP</option>
              <option value="REDUCE">REDUCE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10 shadow-sm">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort("sku_code")}
              >
                <div className="flex items-center gap-1">
                  <span>SKU Code</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort("product_name")}
              >
                <div className="flex items-center gap-1">
                  <span>Product Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-4 py-3">
                Sub-Category
              </th>
              <th scope="col" className="px-4 py-3">
                Brand Type
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort("sales_per_linear_ft")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Sales / Lin Ft</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort("margin_pct")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Margin %</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort("units_sold")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Units Sold</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                In-Stock %
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                Status Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Loading SKU catalog metrics...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-4 py-6 text-center text-red-600 bg-red-50"
                >
                  {error}
                </td>
              </tr>
            ) : filteredSKUs.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No SKUs match the selected filters or search criteria.
                </td>
              </tr>
            ) : (
              filteredSKUs.map((sku) => (
                <tr
                  key={sku.id || sku.sku_code}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-medium text-slate-700">
                    {sku.sku_code}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {sku.product_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sku.sub_category}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        sku.brand_type === "Private Brand"
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {sku.brand_type === "Private Brand" && (
                        <Tag className="w-2.5 h-2.5 text-amber-700" />
                      )}
                      {sku.brand_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    $
                    {sku.sales_per_linear_ft?.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {sku.margin_pct?.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {sku.units_sold?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium ${
                        (sku.in_stock_rate ?? 96) < 95
                          ? "text-amber-600"
                          : "text-slate-700"
                      }`}
                    >
                      {sku.in_stock_rate
                        ? `${sku.in_stock_rate.toFixed(1)}%`
                        : "96.5%"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {renderBadge(sku.action_badge)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing{" "}
          <strong className="text-slate-800">{filteredSKUs.length}</strong> of{" "}
          <strong className="text-slate-800">{skus.length}</strong> items in
          Snacks category
        </span>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh List
        </button>
      </div>
    </div>
  );
}
