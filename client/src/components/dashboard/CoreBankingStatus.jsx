import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { RefreshCw, CheckCircle, AlertTriangle, Wifi } from "lucide-react";

export const CoreBankingStatus = () => {
  const [status, setStatus] = useState("Operational");
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [latency, setLatency] = useState("24ms");
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Simulate API call to sync with core banking
      await api.get("/api/v1/accounts");
      setLastSync(new Date().toLocaleTimeString());
      setLatency(`${Math.floor(Math.random() * 30) + 15}ms`);
      setStatus("Operational");
    } catch (err) {
      setStatus("Degraded");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${status === "Operational" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
        >
          {status === "Operational" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              Core Banking Integration
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === "Operational" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
            >
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Last synced: {lastSync} | Latency: {latency}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900/50 px-2.5 py-1 rounded-lg border border-slate-700/50">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure Tunnel</span>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
          title="Sync with Core Banking"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
};

export default CoreBankingStatus;
