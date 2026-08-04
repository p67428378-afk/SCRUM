import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const sampleData = [
  { day: "Day 1", inbound: 120, outbound: 80 },
  { day: "Day 5", inbound: 200, outbound: 150 },
  { day: "Day 10", inbound: 180, outbound: 220 },
  { day: "Day 15", inbound: 310, outbound: 190 },
  { day: "Day 20", inbound: 250, outbound: 280 },
  { day: "Day 25", inbound: 400, outbound: 310 },
  { day: "Day 30", inbound: 350, outbound: 290 },
];

const StockLevelChart = ({ data = sampleData }) => {
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            30-Day Stock Movements
          </h3>
          <p className="text-xs text-slate-400">
            Inbound Shipments vs Outbound Fulfillment
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>{" "}
            Inbound
          </span>
          <span className="flex items-center gap-1 text-slate-300 ml-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>{" "}
            Outbound
          </span>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
            />
            <Area
              type="monotone"
              dataKey="inbound"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInbound)"
              name="Inbound"
            />
            <Area
              type="monotone"
              dataKey="outbound"
              stroke="#22d3ee"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOutbound)"
              name="Outbound"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockLevelChart;
