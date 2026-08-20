import React, { useEffect, useState } from "react";
import { getContinents, getCountries } from "../services/api.js";
import StatCard from "../components/common/StatCard.jsx";
import ContinentCard from "../components/continents/ContinentCard.jsx";
import {
  Globe,
  Flag,
  DollarSign,
  PieChart,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function ContinentsDashboardPage() {
  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contData, countryData] = await Promise.all([
        getContinents(),
        getCountries({ limit: 100 }),
      ]);
      setContinents(contData);
      setCountries(countryData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(
        "Unable to fetch portfolio data. Please ensure backend API is operational.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAUM = continents.reduce(
    (acc, c) => acc + (c.total_portfolio_assets_usd || 0),
    0,
  );
  const totalCountries = countries.length;
  const activeCountriesCount = countries.filter(
    (c) => (c.portfolio_status || "").toLowerCase() === "active",
  ).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e3e8f0] rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#171c29] tracking-tight">
            🌍 Continents Portfolio Overview
          </h1>
          <p className="text-sm text-[#707a8c] mt-1">
            Global geographical asset allocation, active continent breakdown,
            and country investment portfolio counts.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-[#2663eb] hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Financial KPI Stats Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Portfolio AUM"
          value={`$${(totalAUM / 1e6).toFixed(1)}M`}
          subtitle="Across all tracked continents"
          icon={DollarSign}
          trend="+8.4%"
        />
        <StatCard
          title="Total Continents"
          value={continents.length}
          subtitle="Geographical regions"
          icon={Globe}
        />
        <StatCard
          title="Tracked Countries"
          value={totalCountries}
          subtitle={`${activeCountriesCount} actively performing`}
          icon={Flag}
        />
        <StatCard
          title="Active Status Rate"
          value={
            totalCountries > 0
              ? `${Math.round((activeCountriesCount / totalCountries) * 100)}%`
              : "0%"
          }
          subtitle="Portfolio health compliance"
          icon={PieChart}
        />
      </div>

      {/* Continents Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#171c29]">
            Continents Breakdown
          </h2>
          <span className="text-xs text-[#707a8c] font-medium">
            {continents.length} Regions Available
          </span>
        </div>

        {loading ? (
          <div className="bg-white border border-[#e3e8f0] rounded-xl p-12 text-center text-[#707a8c]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
            <p className="text-sm font-medium">
              Loading continent portfolio cards...
            </p>
          </div>
        ) : continents.length === 0 ? (
          <div className="bg-white border border-[#e3e8f0] rounded-xl p-12 text-center text-[#707a8c]">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-800">
              No continents registered
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please populate continent data in the backend database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continents.map((continent) => (
              <ContinentCard key={continent.id} continent={continent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
