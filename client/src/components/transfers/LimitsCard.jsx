import React, { useState, useEffect } from "react";
import api from "../../services/api";

export const LimitsCard = () => {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const response = await api.get("/api/v1/limits");
      setLimits(response.data);
    } catch (err) {
      setError("Failed to load transfer limits");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-8 bg-slate-700 rounded"></div>
          <div className="h-8 bg-slate-700 rounded"></div>
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
      <h2 className="text-lg font-semibold text-white mb-4">Transfer Limits</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Daily Limit</span>
            <span className="text-white font-semibold">
              {formatCurrency(limits.daily_limit)}
            </span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full"
              style={{
                width: `${((limits.daily_limit - limits.daily_remaining) / limits.daily_limit) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>
              Used:{" "}
              {formatCurrency(limits.daily_limit - limits.daily_remaining)}
            </span>
            <span>Remaining: {formatCurrency(limits.daily_remaining)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Per-Transaction Limit</span>
            <span className="text-white font-semibold">
              {formatCurrency(limits.per_transaction_limit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitsCard;
