import React from "react";

export default function CurrentWeatherCard({
  weatherData,
  unit = "C",
  onToggleFavorite,
  isSaved,
}) {
  if (!weatherData) {
    return (
      <div className="bg-surface-container-high rounded-lg border border-outline-variant p-6 text-center text-on-surface-variant">
        No current weather data available.
      </div>
    );
  }

  const { current, location } = weatherData;
  const temp = unit === "C" ? current.temp_c : current.temp_f;

  // Map condition to material symbols icon
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

  return (
    <section className="col-span-12 lg:col-span-8 bg-surface-container-high rounded-lg border border-outline-variant p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1 flex items-center gap-2">
              {location.name}, {location.country}
              <span className="material-symbols-outlined text-primary text-lg">
                location_on
              </span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {current.updated_at || "Updated recently"}
            </p>
          </div>
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-full hover:bg-surface-container-highest transition-colors ${
                isSaved
                  ? "text-error"
                  : "text-on-surface-variant hover:text-error"
              }`}
              aria-label="Toggle Favorite"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                favorite
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-8 mb-8">
          <div className="flex items-center gap-4">
            <span
              className="material-symbols-outlined text-[64px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {getConditionIcon(current.condition)}
            </span>
            <div>
              <div className="font-display-temp text-display-temp text-on-surface">
                {Math.round(temp)}°{unit}
              </div>
              <div className="font-headline-md text-headline-md text-primary">
                {current.condition}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
          <div className="bg-surface-container p-4 rounded-md border border-outline-variant/50">
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <span className="material-symbols-outlined text-[18px]">
                humidity_percentage
              </span>
              <span className="font-label-caps text-label-caps">HUMIDITY</span>
            </div>
            <div className="font-headline-md text-headline-md">
              {current.humidity}%
            </div>
          </div>
          <div className="bg-surface-container p-4 rounded-md border border-outline-variant/50">
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <span className="material-symbols-outlined text-[18px]">air</span>
              <span className="font-label-caps text-label-caps">WIND</span>
            </div>
            <div className="font-headline-md text-headline-md">
              {current.wind_kph} km/h {current.wind_dir}
            </div>
          </div>
          <div className="bg-surface-container p-4 rounded-md border border-outline-variant/50">
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <span className="material-symbols-outlined text-[18px]">
                speed
              </span>
              <span className="font-label-caps text-label-caps">PRESSURE</span>
            </div>
            <div className="font-headline-md text-headline-md">
              {current.pressure_mb} hPa
            </div>
          </div>
          <div className="bg-surface-container p-4 rounded-md border border-outline-variant/50">
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <span className="material-symbols-outlined text-[18px]">
                wb_sunny
              </span>
              <span className="font-label-caps text-label-caps">UV INDEX</span>
            </div>
            <div className="font-headline-md text-headline-md">
              {current.uv}{" "}
              <span className="text-sm font-normal text-on-surface-variant"></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
