import React, { useState, useEffect } from "react";
import { Calendar, Compass, TrendingUp, RefreshCw } from "lucide-react";
import ForecastGrid from "../components/forecasts/ForecastGrid";
import TrendAnalyticsChart from "../components/forecasts/TrendAnalyticsChart";
import { getLocations, getForecasts, getWeatherHistory } from "../services/api";

export default function ForecastsPage() {
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [forecasts, setForecasts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const locs = await getLocations();
      setLocations(locs);
      if (locs.length > 0 && !selectedLocationId) {
        setSelectedLocationId(locs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForecastAndHistory = async (locId) => {
    if (!locId) return;
    setLoading(true);
    try {
      const fcData = await getForecasts(locId);
      setForecasts(fcData.daily || []);

      const histData = await getWeatherHistory(locId);
      setHistory(histData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      fetchForecastAndHistory(selectedLocationId);
    }
  }, [selectedLocationId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Weather Forecasting & Historical Trends
          </h1>
          <p className="text-xs text-[#BBC9CF] font-mono mt-1">
            7-day predictive weather forecasting, condition modeling, and 30-day
            historical trend analytics
          </p>
        </div>

        {/* Station Selector */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="bg-[#171F33] border border-[#3C494E] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#00D1FF]"
          >
            <option value="">-- Select Weather Station --</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.city || "Station"})
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchForecastAndHistory(selectedLocationId)}
            className="p-2 bg-[#171F33] text-[#BBC9CF] hover:text-white border border-[#3C494E] rounded-lg transition"
            title="Refresh Forecast Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Forecast Grid Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2 font-sans">
          <Calendar className="w-5 h-5 text-[#00D1FF]" /> 7-Day Meteorological
          Outlook
        </h3>
        <ForecastGrid forecasts={forecasts} />
      </div>

      {/* Historical Trend Chart Section */}
      <div className="pt-4">
        <TrendAnalyticsChart historyData={history} />
      </div>
    </div>
  );
}
