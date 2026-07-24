import React, { useState, useEffect } from "react";
import api from "../../services/api";

export const RiskSignalsFeed = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    try {
      const response = await api.get("/api/v1/admin/risk-signals");
      setSignals(response.data);
    } catch (err) {
      setError("Failed to load risk signals. Admin access required.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (score) => {
    if (score >= 80) return "bg-red-500/10 text-red-400 border-red-500/20";
    if (score >= 50)
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  };

  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-700 rounded"></div>
          <div className="h-12 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Real-Time Risk Signals</h2>
        <button
          onClick={fetchSignals}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {signals.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            No risk signals detected.
          </p>
        ) : (
          signals.map((signal) => (
            <div
              key={signal.id}
              className="p-4 bg-slate-900 rounded-lg border border-slate-700 flex justify-between items-start"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white capitalize">
                    {signal.signal_type.replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(signal.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {JSON.stringify(signal.details)}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded border text-xs font-bold ${getRiskBadgeColor(
                  signal.risk_score,
                )}`}
              >
                Score: {signal.risk_score}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RiskSignalsFeed;
