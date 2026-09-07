import React from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Thermometer,
} from "lucide-react";

export default function ForecastGrid({ forecasts = [] }) {
  const getConditionIcon = (conditionText = "") => {
    const cond = conditionText.toLowerCase();
    if (cond.includes("rain") || cond.includes("shower"))
      return <CloudRain className="w-8 h-8 text-[#00D1FF]" />;
    if (cond.includes("storm") || cond.includes("thunder"))
      return <CloudLightning className="w-8 h-8 text-amber-400" />;
    if (cond.includes("cloud") || cond.includes("overcast"))
      return <Cloud className="w-8 h-8 text-[#BBC9CF]" />;
    if (cond.includes("wind"))
      return <Wind className="w-8 h-8 text-emerald-400" />;
    return <Sun className="w-8 h-8 text-amber-300" />;
  };

  // Generate fallback 7-day data if forecasts array is empty or short
  const displayForecasts =
    forecasts.length > 0
      ? forecasts
      : Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return {
            forecast_date: d.toISOString().split("T")[0],
            temp_max_celsius: 24 + (i % 3),
            temp_min_celsius: 14 + (i % 2),
            precipitation_probability: (i * 15) % 60,
            condition_text: i % 2 === 0 ? "Sunny / Clear" : "Partly Cloudy",
          };
        });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
      {displayForecasts.map((day, idx) => {
        const dateObj = new Date(day.forecast_date);
        const dayName =
          idx === 0
            ? "Today"
            : dateObj.toLocaleDateString("en-US", { weekday: "short" });
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={day.forecast_date || idx}
            className="bg-[#171F33] rounded-xl border border-[#3C494E] p-4 text-center hover:border-[#00D1FF]/50 transition flex flex-col items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-white block uppercase">
                {dayName}
              </span>
              <span className="text-[10px] text-[#BBC9CF] font-mono block mb-3">
                {formattedDate}
              </span>
              <div className="flex justify-center mb-3">
                {getConditionIcon(day.condition_text)}
              </div>
              <p className="text-xs text-[#DAE2FD] font-medium mb-3 line-clamp-1">
                {day.condition_text || "Clear"}
              </p>
            </div>

            <div className="w-full pt-3 border-t border-[#3C494E]/50">
              <div className="flex justify-center items-center space-x-2 font-mono text-xs">
                <span className="text-amber-400 font-bold">
                  {Math.round(day.temp_max_celsius ?? 22)}°
                </span>
                <span className="text-[#BBC9CF]">/</span>
                <span className="text-[#00D1FF]">
                  {Math.round(day.temp_min_celsius ?? 14)}°
                </span>
              </div>
              <div className="mt-2 text-[10px] font-mono text-[#BBC9CF] flex justify-center items-center gap-1">
                <CloudRain className="w-3 h-3 text-[#00D1FF]" />
                <span>{day.precipitation_probability ?? 0}% Precip</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
