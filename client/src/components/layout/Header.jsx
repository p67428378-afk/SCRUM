import React from "react";
import { Search, Bell, Building2, User } from "lucide-react";

const Header = ({
  selectedWarehouse,
  onWarehouseChange,
  activeAlertsCount = 0,
}) => {
  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700/60 px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKUs, items, or warehouses..."
            className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/60 text-sm">
          <Building2 className="w-4 h-4 text-slate-400" />
          <select
            value={selectedWarehouse || "ALL"}
            onChange={(e) =>
              onWarehouseChange && onWarehouseChange(e.target.value)
            }
            className="bg-transparent text-slate-200 text-sm focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-800 text-slate-200">
              All Warehouses
            </option>
            <option
              value="11111111-2222-3333-4444-555555555555"
              className="bg-slate-800 text-slate-200"
            >
              Warehouse A (Central)
            </option>
            <option
              value="22222222-3333-4444-5555-666666666666"
              className="bg-slate-800 text-slate-200"
            >
              Warehouse B (North)
            </option>
            <option
              value="33333333-4444-5555-6666-777777777777"
              className="bg-slate-800 text-slate-200"
            >
              Warehouse C (East)
            </option>
          </select>
        </div>

        <div className="relative">
          <button className="p-2 bg-slate-900 border border-slate-700/60 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors relative">
            <Bell className="w-5 h-5" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-700/60 pl-4">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-semibold text-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">
              Inventory Mgr
            </p>
            <p className="text-[10px] text-slate-400">admin@stockpulse.io</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
