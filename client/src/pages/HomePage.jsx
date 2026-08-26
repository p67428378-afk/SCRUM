import React, { useState, useEffect } from "react";
import { listingsService } from "../services/api";
import ListingCard from "../components/ListingCard";
import ListingFilter from "../components/ListingFilter";
import { Dog, Search, SlidersHorizontal, Sparkles } from "lucide-react";

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const initialFilters = {
    search: "",
    breed: "",
    location: "",
    min_price: "",
    max_price: "",
    min_age: "",
    max_age: "",
    min_rating: "",
  };

  const [filters, setFilters] = useState(initialFilters);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingsService.getListings(filters);
      setListings(data || []);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load dog listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary to-blue-700 text-white rounded-2xl p-8 sm:p-12 shadow-lg overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Find Your Perfect Companion Today</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Trusted Dog Marketplace
          </h1>
          <p className="text-sm sm:text-base text-blue-100">
            Browse verified dog listings from certified breeders and caring
            sellers. Filter by breed, age, location, and health records.
          </p>

          {/* Quick Hero Search Input */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-lg">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search breed, keyword, or city..."
                className="w-full pl-9 pr-4 py-2.5 bg-white text-textPrimary rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              onClick={fetchListings}
              className="px-6 py-2.5 bg-accent hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md"
            >
              Search
            </button>
          </div>
        </div>

        {/* Decorative background paw */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none">
          <Dog className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-xl border border-[#e3e8f0]">
          <span className="text-xs font-bold text-textPrimary">
            Search Filters
          </span>
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-lg"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showMobileFilter ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Sidebar Filter */}
        <div
          className={`lg:block ${showMobileFilter ? "block" : "hidden"} lg:col-span-1`}
        >
          <ListingFilter
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Listing Grid */}
        <main className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center bg-white px-5 py-3 rounded-xl border border-[#e3e8f0]">
            <p className="text-xs font-semibold text-textMuted">
              Showing{" "}
              <span className="text-textPrimary font-bold">
                {listings.length}
              </span>{" "}
              dog listings
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl h-72 animate-pulse border border-[#e3e8f0] p-4 space-y-3"
                >
                  <div className="bg-gray-200 h-36 rounded-lg w-full"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700 text-sm">
              <p className="font-semibold">{error}</p>
              <button
                onClick={fetchListings}
                className="mt-3 px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#e3e8f0] p-12 text-center space-y-3">
              <Dog className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-textPrimary">
                No Dogs Found
              </h3>
              <p className="text-xs text-textMuted max-w-sm mx-auto">
                No dog listings match your current filters. Try adjusting your
                breed, price, or location search.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-primary/10 text-primary font-semibold text-xs rounded-lg hover:bg-primary hover:text-white transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
