import React from "react";
import { Store, Calendar } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          <Store size={14} className="text-gray-400" />
          <span>Small Town Value Cluster</span>
          <span className="text-gray-300">|</span>
          <span>Snacks Category</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          DG Cluster Assortment Advisor
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Optimize your product assortment to balance sales performance, shelf
          space, and private brand goals.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 self-start md:self-auto">
        <Calendar size={16} className="text-gray-400" />
        <div className="text-xs">
          <p className="font-semibold text-gray-700">Reporting Week</p>
          <p className="text-gray-500">July 2026 (Current)</p>
        </div>
      </div>
    </header>
  );
}
