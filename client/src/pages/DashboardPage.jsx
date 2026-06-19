import React, { useState, useEffect } from "react";
import { weatherApi, locationsApi } from "../services/api";
import CurrentWeatherCard from "../components/weather/CurrentWeatherCard";
import WeatherForecastList from "../components/weather/WeatherForecastList";
import WeatherInsightsCard from "../components/weather/WeatherInsightsCard";
import LoadingBox from "../components/common/LoadingBox";
import ErrorBox from "../components/common/ErrorBox";

export default function DashboardPage({
  unit,
  activeLocation,
  setActiveLocation,
}) {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch saved locations to check if current is favorited
  const fetchSavedLocations = async () => {
    try {
      const data = await locationsApi.list();
      setSavedLocations(data);

      // If no active location is set, try to find default or use fallback
      if (!activeLocation) {
        const defaultLoc = data.find((l) => l.is_default);
        const lastSearched = localStorage.getItem("last_searched_location");
        const initialLoc =
          lastSearched || (defaultLoc ? defaultLoc.name : "London");
        setActiveLocation(initialLoc);
      }
    } catch (err) {
      console.error("Failed to fetch saved locations", err);
    }
  };

  const fetchWeatherData = async (locationName) => {
    if (!locationName) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch current, forecast, and insights in parallel
      const [current, forecast, insights] = await Promise.all([
        weatherApi.getCurrent(locationName),
        weatherApi.getForecast(locationName),
        weatherApi.getInsights(locationName),
      ]);

      setWeatherData(current);
      setForecastData(forecast);
      setInsightsData(insights);

      // Save to local storage
      localStorage.setItem("last_searched_location", locationName);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to fetch weather data. Please check the location name.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  useEffect(() => {
    if (activeLocation) {
      fetchWeatherData(activeLocation);
    }
  }, [activeLocation]);

  const handleToggleFavorite = async () => {
    if (!weatherData) return;
    const { location } = weatherData;
    const isSaved = savedLocations.some(
      (l) => l.name.toLowerCase() === location.name.toLowerCase(),
    );

    try {
      if (isSaved) {
        const savedItem = savedLocations.find(
          (l) => l.name.toLowerCase() === location.name.toLowerCase(),
        );
        await locationsApi.delete(savedItem.id);
      } else {
        await locationsApi.create({
          name: location.name,
          country: location.country,
          is_default: savedLocations.length === 0, // Make default if it's the first one
        });
      }
      fetchSavedLocations();
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const isCurrentSaved = weatherData
    ? savedLocations.some(
        (l) => l.name.toLowerCase() === weatherData.location.name.toLowerCase(),
      )
    : false;

  if (loading && !weatherData) {
    return <LoadingBox />;
  }

  if (error) {
    return (
      <ErrorBox
        message={error}
        onRetry={() => fetchWeatherData(activeLocation)}
      />
    );
  }

  return (
    <div className="grid grid-cols-12 gap-gutter items-start w-full">
      {/* Current Weather & Insights */}
      <div className="col-span-12 lg:col-span-8 grid grid-cols-12 gap-gutter">
        <div className="col-span-12">
          <CurrentWeatherCard
            weatherData={weatherData}
            unit={unit}
            onToggleFavorite={handleToggleFavorite}
            isSaved={isCurrentSaved}
          />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 h-full">
        <WeatherInsightsCard insightsData={insightsData} unit={unit} />
      </div>

      {/* 5-Day Forecast */}
      <div className="col-span-12">
        <WeatherForecastList forecastData={forecastData} unit={unit} />
      </div>
    </div>
  );
}
