import React from "react";

export default function WeatherInsightsCard({ insightsData, unit = "C" }) {
  if (!insightsData) {
    return (
      <section className="col-span-12 lg:col-span-4 bg-surface-container-high rounded-lg border border-outline-variant p-6 h-full flex flex-col text-center text-on-surface-variant">
        No insights available.
      </section>
    );
  }

  const { insights, trend = [] } = insightsData;

  // Calculate max temperature to scale the bars
  const temps = trend.map((t) => (unit === "C" ? t.temp_c : t.temp_f));
  const maxTemp = Math.max(...temps, 1);
  const minTemp = Math.min(...temps, 0);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <section className="col-span-12 lg:col-span-4 bg-surface-container-high rounded-lg border border-outline-variant p-6 h-full flex flex-col">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">insights</span>
        Daily Insights
      </h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 leading-relaxed">
        {insights || "No insights available for this location."}
      </p>

      {trend.length > 0 && (
        <div className="mt-auto">
          <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase">
            6-Hour Trend
          </h4>
          <div className="h-[150px] relative border-b border-outline-variant/50 pb-4 flex items-end justify-between px-2">
            {trend.map((item, index) => {
              const temp = unit === "C" ? item.temp_c : item.temp_f;
              // Calculate height percentage based on min/max range
              const heightPercent = Math.max(
                20,
                ((temp - minTemp) / tempRange) * 100,
              );
              const opacity = 1 - index * 0.15;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-surface-container border border-outline-variant text-on-surface text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    {Math.round(temp)}°{unit}
                  </div>
                  {/* Bar */}
                  <div
                    style={{
                      height: `${heightPercent}%`,
                      opacity: Math.max(0.2, opacity),
                    }}
                    className="w-3 bg-primary rounded-t-sm transition-all duration-500 hover:bg-primary-fixed-dim"
                  ></div>
                  {/* Time Label */}
                  <span className="absolute bottom-[-24px] text-[10px] text-on-surface-variant font-label-caps">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-8 text-sm font-semibold px-1">
            {trend.map((item, index) => {
              const temp = unit === "C" ? item.temp_c : item.temp_f;
              return (
                <span key={index} className="text-on-surface text-xs">
                  {Math.round(temp)}°
                </span>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
