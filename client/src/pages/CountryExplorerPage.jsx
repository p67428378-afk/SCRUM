import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getContinents, getCountries } from "../services/api.js";
import CountryFilterBar from "../components/countries/CountryFilterBar.jsx";
import CountryTable from "../components/countries/CountryTable.jsx";
import { Compass, AlertCircle, Plus, RefreshCw } from "lucide-react";

export default function CountryExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialContinent =
    searchParams.get("continent_id") || searchParams.get("continent") || "";

  const [search, setSearch] = useState("");
  const [selectedContinent, setSelectedContinent] = useState(initialContinent);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state if searchParams change externally
  useEffect(() => {
    const contParam =
      searchParams.get("continent_id") || searchParams.get("continent") || "";
    if (contParam !== selectedContinent) {
      setSelectedContinent(contParam);
    }
  }, [searchParams]);

  useEffect(() => {
    getContinents().then(setContinents).catch(console.error);
  }, []);

  const fetchFilteredCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCountries({
        search: search.trim(),
        continent_id: selectedContinent,
        status: selectedStatus,
        limit: 100,
      });
      setCountries(data);
    } catch (err) {
      console.error("Failed to fetch country records:", err);
      setError("Unable to fetch countries. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchFilteredCountries();
    }, 200);

    return () => clearTimeout(handler);
  }, [search, selectedContinent, selectedStatus]);

  const handleReset = () => {
    setSearch("");
    setSelectedContinent("");
    setSelectedStatus("");
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e3e8f0] rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#2663eb] font-bold text-sm uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Country Portfolio Explorer</span>
          </div>
          <h1 className="text-2xl font-bold text-[#171c29]">
            Search & Filter Portfolio Countries
          </h1>
          <p className="text-sm text-[#707a8c] mt-1">
            Browse portfolio country profiles, query by geographical code/name,
            and filter by continent or active status.
          </p>
        </div>

        <button
          onClick={fetchFilteredCountries}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-[#2663eb] hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <CountryFilterBar
        search={search}
        setSearch={setSearch}
        selectedContinent={selectedContinent}
        setSelectedContinent={(val) => {
          setSelectedContinent(val);
          if (val) setSearchParams({ continent_id: val });
          else setSearchParams({});
        }}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        continents={continents}
        onReset={handleReset}
      />

      {/* Summary Banner */}
      <div className="flex items-center justify-between px-1 text-sm font-medium text-[#707a8c]">
        <span>
          Showing <strong className="text-[#171c29]">{countries.length}</strong>{" "}
          matching country records
        </span>
      </div>

      {/* Country Table */}
      <CountryTable countries={countries} isLoading={loading} />
    </div>
  );
}
