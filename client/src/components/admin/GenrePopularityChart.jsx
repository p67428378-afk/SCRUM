import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = [
  "#2663EB",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DC2626",
  "#0891B2",
  "#4F46E5",
  "#0D9488",
];

export const GenrePopularityChart = ({ data = [] }) => {
  const chartData = Array.isArray(data) ? data : [];
  const totalCheckouts = chartData.reduce(
    (sum, item) => sum + (item.checkout_count || 0),
    0,
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            <span>Most Popular Genres</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Checkout volume aggregated across library categories
          </p>
        </div>
        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
          Total Checkouts: {totalCheckouts}
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <BarChart3 size={36} className="mb-2 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            No checkout data available
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Genre popularity will populate once books are borrowed.
          </p>
        </div>
      ) : (
        <div className="w-full h-72 min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="genre"
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#CBD5E1" }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#CBD5E1" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E2E8F0",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`${value} checkouts`, "Checkout Volume"]}
                labelStyle={{ fontWeight: "bold", color: "#1E293B" }}
              />
              <Bar dataKey="checkout_count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.genre || index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GenrePopularityChart;
