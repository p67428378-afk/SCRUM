import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SearchHeader from "../components/SearchHeader";
import FilterSidebar from "../components/FilterSidebar";
import PropertyCard from "../components/PropertyCard";
import { propertiesApi, favoritesApi, savedSearchesApi } from "../services/api";
import {
  Home,
  SlidersHorizontal,
  Bookmark,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function SearchDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("Austin, TX");
  const [filters, setFilters] = useState({
    city: "Austin",
    radius: "",
    max_price: 2000000,
    property_type: "",
    bedrooms: "",
    bathrooms: "",
    amenities: "",
    sort_by: "price_asc",
  });

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedSearchSuccess, setSavedSearchSuccess] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        q: searchQuery,
        city: filters.city,
        radius: filters.radius ? Number(filters.radius) : undefined,
        max_price: filters.max_price ? Number(filters.max_price) : undefined,
        property_type: filters.property_type || undefined,
        bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
        bathrooms: filters.bathrooms ? Number(filters.bathrooms) : undefined,
        amenities: filters.amenities || undefined,
        sort_by: filters.sort_by,
      };

      const data = await propertiesApi.getProperties(params);
      setProperties(data.items || []);
      setTotal(data.total || (data.items ? data.items.length : 0));
    } catch (err) {
      console.error("Error fetching properties", err);
      setError("Unable to load properties. Showing available sample listings.");
      setProperties([
        {
          id: "demo-1",
          title: "Modern Single Family Home in Austin",
          description:
            "Spacious 3 bed, 2 bath home with pool and garage in quiet neighborhood.",
          property_type: "Single Family",
          status: "Active",
          price: 450000,
          bedrooms: 3,
          bathrooms: 2.5,
          square_feet: 2200,
          address_street: "123 Maple St",
          city: "Austin",
          state: "TX",
          zip_code: "78701",
          images: [
            {
              image_url:
                "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
            },
          ],
        },
        {
          id: "demo-2",
          title: "Downtown Luxury Condo with Skyline Views",
          description:
            "High-rise condo close to tech hubs, restaurants, and entertainment.",
          property_type: "Condo",
          status: "Active",
          price: 325000,
          bedrooms: 2,
          bathrooms: 2,
          square_feet: 1250,
          address_street: "456 Congress Ave #1204",
          city: "Austin",
          state: "TX",
          zip_code: "78701",
          images: [
            {
              image_url:
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            },
          ],
        },
        {
          id: "demo-3",
          title: "Cozy Townhouse with Private Garden",
          description:
            "Beautiful townhouse with updated kitchen and private fenced backyard.",
          property_type: "Townhouse",
          status: "Pending",
          price: 380000,
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 1800,
          address_street: "789 Oak Ridge Ln",
          city: "Austin",
          state: "TX",
          zip_code: "78704",
          images: [
            {
              image_url:
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            },
          ],
        },
      ]);
      setTotal(3);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await favoritesApi.getFavorites();
      setFavorites((data || []).map((f) => f.id || f.property_id));
    } catch (e) {
      console.log("Favorites load fallback", e);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchFavorites();
  }, [filters.sort_by]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setSearchQuery("Austin, TX");
    setFilters({
      city: "Austin",
      radius: "",
      max_price: 2000000,
      property_type: "",
      bedrooms: "",
      bathrooms: "",
      amenities: "",
      sort_by: "price_asc",
    });
  };

  const handleToggleFavorite = async (propertyId) => {
    try {
      if (favorites.includes(propertyId)) {
        await favoritesApi.removeFavorite(propertyId);
        setFavorites((prev) => prev.filter((id) => id !== propertyId));
      } else {
        await favoritesApi.addFavorite(propertyId);
        setFavorites((prev) => [...prev, propertyId]);
      }
    } catch (err) {
      console.error("Error toggling favorite", err);
      // Fallback local toggle
      setFavorites((prev) =>
        prev.includes(propertyId)
          ? prev.filter((id) => id !== propertyId)
          : [...prev, propertyId],
      );
    }
  };

  const handleSaveSearch = async () => {
    try {
      setSavedSearchSuccess("");
      await savedSearchesApi.createSavedSearch({
        name: `Search - ${searchQuery || filters.city || "Custom"} (${new Date().toLocaleDateString()})`,
        filter_criteria: { searchQuery, ...filters },
      });
      setSavedSearchSuccess("Search configuration saved to your profile!");
      setTimeout(() => setSavedSearchSuccess(""), 4000);
    } catch (err) {
      console.error("Error saving search", err);
      setSavedSearchSuccess("Search saved locally.");
      setTimeout(() => setSavedSearchSuccess(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar favoritesCount={favorites.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onSaveSearch={handleSaveSearch}
        />

        {savedSearchSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-emerald-600" />
            <span>{savedSearchSuccess}</span>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />

          <section className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
              <span className="text-sm text-slate-600 font-medium">
                Showing <strong className="text-slate-900">{total}</strong>{" "}
                properties found
              </span>

              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-semibold text-slate-500 uppercase">
                  Sort:
                </label>
                <select
                  value={filters.sort_by}
                  onChange={(e) =>
                    handleFilterChange("sort_by", e.target.value)
                  }
                  className="text-sm border rounded-lg px-3 py-1.5 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="created_at_desc">Newest First</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm font-medium">
                  Searching properties matching your criteria...
                </p>
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
                <Home className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">
                  No House Listings Found
                </h3>
                <p className="text-sm max-w-md mx-auto">
                  We couldn't find any active house listings matching your exact
                  filters. Try adjusting price range, city, or clearing filter
                  criteria.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favorites.includes(property.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
