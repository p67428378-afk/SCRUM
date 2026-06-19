import React from "react";

export default function ForecastCard({ dayData, unit = "C" }) {
  const highTemp = unit === "C" ? dayData.temp_high_c : dayData.temp_high_f;
  const lowTemp = unit === "C" ? dayData.temp_low_c : dayData.temp_low_f;

  const getConditionIcon = (condition) => {
    const cond = condition.toLowerCase();
    if (cond.includes("sunny") || cond.includes("clear")) return "wb_sunny";
    if (cond.includes("cloudy") || cond.includes("overcast")) return "cloud";
    if (
      cond.includes("rain") ||
      cond.includes("drizzle") ||
      cond.includes("shower")
    )
      return "rainy";
    if (cond.includes("thunder") || cond.includes("storm"))
      return "thunderstorm";
    if (
      cond.includes("snow") ||
      cond.includes("sleet") ||
      cond.includes("hail")
    )
      return "ac_unit";
    return "partly_cloudy_day";
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-lg p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
      <div className="w-24 font-body-lg text-body-lg font-semibold">
        {getDayName(dayData.date)}
      </div>
      <div className="flex items-center gap-3 w-32">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {getConditionIcon(dayData.condition)}
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {dayData.condition}
        </span>
      </div>
      <div className="flex items-center gap-2 w-24 text-primary font-body-sm text-body-sm">
        <span className="material-symbols-outlined text-[16px]">
          water_drop
        </span>
        {Math.round(dayData.rain_probability * 100)}%
      </div>
      <div className="w-24 text-right font-headline-md text-headline-md">
        {Math.round(highTemp)}°
        <span className="text-on-surface-variant text-base">
          /{Math.round(lowTemp)}°
        </span>
      </div>
    </div>
  );
}
