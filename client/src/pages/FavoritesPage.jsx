import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PropertyCard from "../components/PropertyCard";
import { favoritesApi, savedSearchesApi } from "../services/api";
import {
  Heart,
  Bookmark,
  Trash2,
  Search,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("properties"); // 'properties' | 'searches'
  const [favorites, setFavorites] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [favData, searchData] = await Promise.all([
        favoritesApi.getFavorites().catch(() => []),
        savedSearchesApi.getSavedSearches().catch(() => []),
      ]);
      setFavorites(favData || []);
      setSavedSearches(searchData || []);
    } catch (err) {
      console.error("Error loading favorites or saved searches", err);
      setError("Showing local saved items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoveFavorite = async (propertyId) => {
    try {
      await favoritesApi.removeFavorite(propertyId);
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (e) {
      console.error("Failed to remove favorite", e);
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
    }
  };

  const handleDeleteSavedSearch = async (searchId) => {
    try {
      await savedSearchesApi.deleteSavedSearch(searchId);
      setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
    } catch (e) {
      console.error("Failed to delete saved search", e);
      setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
    }
  };

  const handleRunSearch = (searchItem) => {
    const params = new URLSearchParams(searchItem.filter_criteria || {});
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar favoritesCount={favorites.length} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Saved Items
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Access your saved house listings and automated search alerts in one
            place.
          </p>
        </div>

        {/* Dual Tab Navigation */}
        <div className="flex space-x-6 border-b border-slate-200 text-sm font-bold">
          <button
            onClick={() => setActiveTab("properties")}
            className={`pb-3 flex items-center space-x-2 transition ${
              activeTab === "properties"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Saved Properties ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("searches")}
            className={`pb-3 flex items-center space-x-2 transition ${
              activeTab === "searches"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bookmark className="w-4 h-4 text-blue-500" />
            <span>Saved Searches ({savedSearches.length})</span>
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium">Loading saved items...</p>
          </div>
        ) : activeTab === "properties" ? (
          favorites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <Heart className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">
                No Saved Favorite Houses
              </h3>
              <p className="text-sm max-w-md mx-auto">
                Click the heart icon on any property card while browsing to save
                your favorite houses here.
              </p>
              <Link
                to="/search"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition"
              >
                Explore Properties
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={true}
                  onToggleFavorite={() => handleRemoveFavorite(property.id)}
                />
              ))}
            </div>
          )
        ) : savedSearches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              No Saved Search Alerts
            </h3>
            <p className="text-sm max-w-md mx-auto">
              Save search filters from the search dashboard to get quick access
              and notification updates.
            </p>
            <Link
              to="/search"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition"
            >
              Go to Search
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {savedSearches.map((searchItem) => (
                <div
                  key={searchItem.id}
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-base">
                      {searchItem.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {Object.entries(searchItem.filter_criteria || {}).map(
                        ([key, val]) =>
                          val && (
                            <span
                              key={key}
                              className="bg-slate-100 px-2 py-0.5 rounded-full font-medium"
                            >
                              {key}: {String(val)}
                            </span>
                          ),
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Saved on{" "}
                      {new Date(
                        searchItem.created_at || Date.now(),
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      onClick={() => handleRunSearch(searchItem)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Run Search</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSavedSearch(searchItem.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                      title="Delete saved search"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
