import React, { useState, useMemo } from "react";
import { Search, Filter, AlertCircle } from "lucide-react";

const SKUTable = ({ skus = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredSKUs = useMemo(() => {
    return skus.filter((sku) => {
      // Search matching
      const matchesSearch =
        searchTerm.trim() === "" ||
        sku.sku_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.product_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Brand matching
      let matchesBrand = true;
      if (brandFilter === "PRIVATE") {
        matchesBrand = sku.is_private_brand === true;
      } else if (brandFilter === "NATIONAL") {
        matchesBrand = sku.is_private_brand === false;
      }

      // Status badge matching
      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = sku.status_badge === statusFilter;
      }

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [skus, searchTerm, brandFilter, statusFilter]);

  const renderBadge = (status) => {
    switch (status) {
      case "GROW":
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1">
            GROW
          </span>
        );
      case "MAINTAIN":
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1">
            MAINTAIN
          </span>
        );
      case "SWAP":
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1">
            SWAP
          </span>
        );
      case "REDUCE":
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1">
            REDUCE
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
      data-testid="sku-performance-section"
    >
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Snacks SKU Performance & Action Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Active assortment performance metrics and recommended facing actions
            ({filteredSKUs.length} SKUs listed)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SKU or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs border border-slate-300 rounded pl-8 pr-3 py-1.5 w-56 sm:w-64 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400"
              aria-label="Search SKU or Product"
            />
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-slate-500"
              aria-label="Filter by Brand"
            >
              <option value="ALL">All Brands</option>
              <option value="PRIVATE">Clover Valley (Private Brand)</option>
              <option value="NATIONAL">National / Regional Brands</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-slate-500"
              aria-label="Filter by Action Status"
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
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center" data-testid="sku-table-loading">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E2229]"></div>
            <p className="mt-2 text-xs text-slate-500">
              Loading SKU assortment ledger...
            </p>
          </div>
        ) : filteredSKUs.length === 0 ? (
          <div
            className="p-12 text-center text-slate-500 space-y-2"
            data-testid="sku-table-empty"
          >
            <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-medium">
              No SKUs matching your filter criteria.
            </p>
            <p className="text-xs">
              Try adjusting your search terms or clearing filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setBrandFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="text-xs text-blue-600 hover:underline pt-2 inline-block font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <table
            className="w-full text-left text-xs text-slate-700"
            data-testid="sku-table"
          >
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Brand Type</th>
                <th className="py-3 px-4 text-right">Weekly Units</th>
                <th className="py-3 px-4 text-right">Sales / Linear Ft</th>
                <th className="py-3 px-4 text-right">Margin %</th>
                <th className="py-3 px-4 text-center">Space (ft)</th>
                <th className="py-3 px-4 text-center">Action Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[12px]">
              {filteredSKUs.map((sku) => {
                const brandLabel = sku.is_private_brand
                  ? "Clover Valley (Private Brand)"
                  : sku.product_name.includes("Regional") ||
                      sku.product_name.includes("Southern") ||
                      sku.product_name.includes("Prairie") ||
                      sku.product_name.includes("Rustic")
                    ? "Regional Brand"
                    : "National Brand";

                const salesFormatted = `$${Number(sku.sales_per_linear_ft || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                const marginFormatted = `${Number(sku.margin_percentage || 0).toFixed(1)}%`;
                const spaceFormatted = `${Number(sku.linear_ft_allocated || 1.0).toFixed(1)} ft`;

                return (
                  <tr
                    key={sku.id || sku.sku_code}
                    className="hover:bg-slate-50/80 transition"
                    data-testid={`sku-row-${sku.sku_code}`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {sku.sku_code}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">
                      {sku.product_name}
                      {sku.is_private_brand && (
                        <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-sans">
                          PB
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">
                      {brandLabel}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {Math.round(sku.weekly_units_sold || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {salesFormatted}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {marginFormatted}
                    </td>
                    <td className="py-3 px-4 text-center font-sans text-slate-600">
                      {spaceFormatted}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {renderBadge(sku.status_badge)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default SKUTable;
