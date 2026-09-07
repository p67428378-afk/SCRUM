import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Download, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";

export default function TrendAnalyticsChart({ historyData = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  // Generate fallback data if history is empty
  const dataToDisplay =
    historyData.length > 0
      ? historyData
      : Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return {
            recorded_at: d.toISOString().split("T")[0],
            temperature_celsius: 18 + Math.sin(i / 2) * 6 + (i % 3),
            humidity_percent: 50 + Math.cos(i / 3) * 20,
            precipitation_inches: i % 5 === 0 ? 0.3 + (i % 2) * 0.4 : 0,
            wind_speed_mph: 8 + (i % 7),
          };
        });

  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage);
  const paginatedData = dataToDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const exportCSV = () => {
    const headers = [
      "Date",
      "Temperature (C)",
      "Humidity (%)",
      "Precipitation (in)",
      "Wind Speed (mph)",
    ];
    const rows = dataToDisplay.map((row) => [
      row.recorded_at,
      row.temperature_celsius,
      row.humidity_percent,
      row.precipitation_inches,
      row.wind_speed_mph,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `weather_trends_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#171F33] rounded-xl border border-[#3C494E] p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#3C494E] mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#00D1FF]" /> Historical Weather
            Trends & Analytics
          </h3>
          <p className="text-xs text-[#BBC9CF] font-mono mt-1">
            Comparative multi-metric timeline visualization (Total records:{" "}
            {dataToDisplay.length})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 bg-[#222A3D] hover:bg-[#3C494E] text-[#00D1FF] border border-[#00D1FF]/40 px-3 py-1.5 rounded-lg text-xs font-mono transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Temperature & Humidity Line Chart */}
      <div className="h-72 w-full mb-8">
        <span className="text-xs font-semibold text-[#BBC9CF] block mb-2 font-mono">
          TEMPERATURE (°C) vs HUMIDITY (%)
        </span>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={paginatedData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3C494E"
              opacity={0.5}
            />
            <XAxis
              dataKey="recorded_at"
              stroke="#BBC9CF"
              fontSize={10}
              tickFormatter={(str) => str.slice(5)}
            />
            <YAxis
              yAxisId="left"
              stroke="#00D1FF"
              fontSize={10}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10B981"
              fontSize={10}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171F33",
                borderColor: "#3C494E",
                color: "#DAE2FD",
                borderRadius: "8px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", fontFamily: "JetBrains Mono" }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature_celsius"
              name="Temperature (°C)"
              stroke="#00D1FF"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="humidity_percent"
              name="Humidity (%)"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#3C494E] text-xs font-mono text-[#BBC9CF]">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 bg-[#222A3D] rounded border border-[#3C494E] disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 bg-[#222A3D] rounded border border-[#3C494E] disabled:opacity-40 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
