import React from "react";
import ForecastCard from "./ForecastCard";

export default function WeatherForecastList({ forecastData, unit = "C" }) {
  if (
    !forecastData ||
    !forecastData.forecast ||
    forecastData.forecast.length === 0
  ) {
    return (
      <div className="bg-surface-container-high rounded-lg border border-outline-variant p-6 text-center text-on-surface-variant">
        No forecast data available.
      </div>
    );
  }

  return (
    <section className="col-span-12 mt-4">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-4">
        5-Day Forecast
      </h3>
      <div className="flex flex-col gap-3">
        {forecastData.forecast.map((day, index) => (
          <ForecastCard key={day.date || index} dayData={day} unit={unit} />
        ))}
      </div>
    </section>
  );
}
