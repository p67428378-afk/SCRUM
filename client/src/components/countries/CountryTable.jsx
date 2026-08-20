import React from "react";
import { Link } from "react-router-dom";
import Badge from "../common/Badge.jsx";
import { ArrowUpRight, ChevronRight, Globe2 } from "lucide-react";

export default function CountryTable({ countries = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#e3e8f0] rounded-xl p-8 text-center text-[#707a8c]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
        <p className="text-sm font-medium">Loading country portfolio data...</p>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="bg-white border border-[#e3e8f0] rounded-xl p-12 text-center">
        <Globe2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-gray-800">
          No countries found
        </h4>
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          Try adjusting your search keywords or active continent/status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-[#707a8c] uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Country</th>
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Continent</th>
              <th className="py-3.5 px-4">Capital</th>
              <th className="py-3.5 px-4">Population</th>
              <th className="py-3.5 px-4">Portfolio Status</th>
              <th className="py-3.5 px-4 text-right">Investment (USD)</th>
              <th className="py-3.5 px-4 sm:px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-[#171c29]">
            {countries.map((c) => (
              <tr key={c.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="py-4 px-4 sm:px-6 font-semibold text-blue-900">
                  <Link
                    to={`/countries/${c.id}`}
                    className="hover:underline flex items-center gap-2"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="py-4 px-4 font-mono text-xs text-gray-600">
                  {c.code}
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {c.continent_name || "N/A"}
                </td>
                <td className="py-4 px-4 text-gray-600">{c.capital || "—"}</td>
                <td className="py-4 px-4 text-gray-600">
                  {c.population ? c.population.toLocaleString("en-US") : "—"}
                </td>
                <td className="py-4 px-4">
                  <Badge status={c.portfolio_status} />
                </td>
                <td className="py-4 px-4 text-right font-semibold text-blue-700">
                  $
                  {(c.total_investment_usd || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                  })}
                </td>
                <td className="py-4 px-4 sm:px-6 text-center">
                  <Link
                    to={`/countries/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
