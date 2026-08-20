import React from "react";
import { Building2, Shield, Info } from "lucide-react";

export default function UTDirectoryTable({ regions, onSelectRegion }) {
  const unionTerritories = regions.filter((r) => r.type === "union_territory");

  const getGovernanceType = (name) => {
    // Delhi, Puducherry, J&K have elected assemblies; others are directly administered by Lt Governor/Administrator
    if (["Delhi", "Puducherry", "Jammu and Kashmir"].includes(name)) {
      return "UT with Legislative Assembly";
    }
    return "Direct Union Administration";
  };

  return (
    <div className="bg-white border border-[#E3E8F0] p-6 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#0F172A] text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D97706]" />
            <span>Union Territory Governance Directory</span>
          </h3>
          <p className="text-xs text-[#707A8C] mt-0.5">
            Detailed breakdown of all 8 Union Territories and their
            administrative frameworks
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-[#D97706]/10 text-[#D97706] rounded-full">
          8 UTs Total
        </span>
      </div>

      <div className="overflow-x-auto border border-[#E3E8F0] rounded-xl">
        <table className="w-full text-left text-xs text-[#0F172A]">
          <thead className="bg-[#F8FAFC] border-b border-[#E3E8F0] text-[#707A8C] font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Union Territory</th>
              <th className="px-4 py-3">Capital City</th>
              <th className="px-4 py-3">Governance Structure</th>
              <th className="px-4 py-3">ISO Code</th>
              <th className="px-4 py-3 text-right">Population</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E8F0]">
            {unionTerritories.map((ut) => (
              <tr
                key={ut.id || ut.name}
                className="hover:bg-[#F8FAFC] transition"
              >
                <td className="px-4 py-3 font-bold text-[#0F172A]">
                  {ut.name}
                </td>
                <td className="px-4 py-3 font-medium text-[#475569]">
                  {ut.capital}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] text-[#334155]">
                    {getGovernanceType(ut.name)}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[#707A8C]">
                  {ut.iso_code || "N/A"}
                </td>
                <td className="px-4 py-3 text-right font-medium text-[#0F172A]">
                  {ut.population ? ut.population.toLocaleString() : "N/A"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onSelectRegion(ut)}
                    className="text-[#2563EB] hover:underline font-semibold text-xs"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
