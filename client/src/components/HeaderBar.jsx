import React, { useState } from "react";
import {
  Store,
  ShieldCheck,
  History,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function HeaderBar({
  clusterName,
  onOpenAuditTrail,
  backendConnected,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand and Title */}
        <div className="flex items-center gap-3">
          <div className="bg-[#ECC000] text-black font-black text-sm sm:text-base px-2.5 py-1 rounded tracking-tight shadow-inner flex items-center justify-center">
            DOLLAR GENERAL
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              DG Cluster Assortment Advisor
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 font-medium text-amber-300">
                <Store className="w-3.5 h-3.5 text-[#ECC000]" />
                {clusterName || "Small Town Value Cluster"}
              </span>
              <span>•</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium">
                Category: Snacks & Beverages
              </span>
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              backendConnected
                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/80"
                : "bg-amber-950/60 text-amber-400 border-amber-800/80"
            }`}
          >
            {backendConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>API Connected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Connecting...</span>
              </>
            )}
          </div>

          {/* Audit Trail Button */}
          <button
            onClick={onOpenAuditTrail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shadow-sm"
            title="View Submission Audit Trail"
          >
            <History className="w-3.5 h-3.5 text-[#ECC000]" />
            <span>Audit Trail</span>
          </button>

          {/* User Profile / Info */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-850 text-slate-200 text-xs border border-slate-700 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs">
                CM
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-medium leading-none text-slate-100">
                  Category Manager
                </p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  test@example.com
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 z-50 text-xs">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-700">
                  <User className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-semibold text-slate-100">
                      Dollar General Merchandising
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Role: Category Manager (Snacks)
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-[11px] mb-2">
                  Test account:{" "}
                  <span className="text-amber-300 font-mono">
                    test@example.com / testpassword
                  </span>
                </p>
                <div className="bg-slate-900/80 p-2 rounded border border-slate-700/60 text-[11px] text-slate-400">
                  Cluster: Small Town Value Cluster
                  <br />
                  Scope: Single-Canvas Decision Advisor
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
