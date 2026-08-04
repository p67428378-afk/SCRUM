import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const defaultDistribution = [
  { name: "Warehouse A (Central)", value: 450, color: "#6366f1" },
  { name: "Warehouse B (North)", value: 300, color: "#10b981" },
  { name: "Warehouse C (East)", value: 250, color: "#06b6d4" },
];

const WarehouseDonutChart = ({ data = defaultDistribution }) => {
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-5 mb-6">
      <h3 className="text-base font-semibold text-white mb-1">
        Warehouse Distribution
      </h3>
      <p className="text-xs text-slate-400 mb-4">Stock breakdown by location</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#6366f1"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-slate-300 text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WarehouseDonutChart;
