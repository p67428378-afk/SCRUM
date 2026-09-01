import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Dot,
} from "recharts";
import { propertiesApi } from "../services/api";
import { TrendingDown, TrendingUp, Tag, Info, AlertCircle } from "lucide-react";

export default function PriceHistoryChart({
  propertyId,
  initialHistory = null,
}) {
  const [history, setHistory] = useState(initialHistory || []);
  const [loading, setLoading] = useState(!initialHistory && !!propertyId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialHistory) {
      setHistory(initialHistory);
      setLoading(false);
      return;
    }

    if (!propertyId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await propertiesApi.getPriceHistory(propertyId);
        if (isMounted) {
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Error loading price history:", err);
        if (isMounted) {
          setError("Failed to load price history from server.");
          // Fallback demo data
          setHistory([
            {
              id: "h-1",
              property_id: propertyId,
              price: 475000,
              change_event: "listed",
              recorded_at: "2025-10-01T00:00:00Z",
            },
            {
              id: "h-2",
              property_id: propertyId,
              price: 460000,
              change_event: "price_drop",
              recorded_at: "2025-11-15T00:00:00Z",
            },
            {
              id: "h-3",
              property_id: propertyId,
              price: 450000,
              change_event: "price_drop",
              recorded_at: "2026-01-10T00:00:00Z",
            },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [propertyId, initialHistory]);

  const formatPrice = (value) => `$${Number(value || 0).toLocaleString()}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getEventBadge = (eventStr) => {
    const ev = (eventStr || "").toLowerCase();
    if (ev === "price_drop") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <TrendingDown className="w-3 h-3 mr-1" />
          <span>Price Drop</span>
        </span>
      );
    }
    if (ev === "price_increase") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span>Price Increase</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <Tag className="w-3 h-3 mr-1" />
        <span>Listed</span>
      </span>
    );
  };

  const formattedChartData = history.map((item) => ({
    date: formatDate(item.recorded_at),
    price: Number(item.price),
    change_event: item.change_event,
    rawDate: item.recorded_at,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1.5">
          <div className="text-slate-400 font-medium">{data.date}</div>
          <div className="text-base font-bold text-blue-400">
            {formatPrice(data.price)}
          </div>
          <div>{getEventBadge(data.change_event)}</div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center space-x-2">
        <span className="animate-pulse">Loading price trajectory chart...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
        <Info className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-sm font-medium text-slate-700">
          No price history available
        </p>
        <p className="text-xs text-slate-500">
          Price modifications will automatically appear here as changes occur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {history.length === 1 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs p-3 rounded-xl flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>No price modifications recorded since listing.</span>
        </div>
      )}

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedChartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              tick={{ fill: "#64748b", fontSize: 12 }}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={3}
              activeDot={{ r: 8, fill: "#1d4ed8" }}
              dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* History Log Event Table */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Price Modifications History
        </h4>
        <div className="divide-y divide-slate-100 text-sm">
          {history.map((item, idx) => (
            <div
              key={item.id || idx}
              className="py-2.5 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {getEventBadge(item.change_event)}
                <span className="font-bold text-slate-900">
                  {formatPrice(item.price)}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {formatDate(item.recorded_at)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
