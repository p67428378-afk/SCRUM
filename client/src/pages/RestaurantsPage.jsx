import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { restaurantService } from "../services/api.js";
import RestaurantCard from "../components/restaurants/RestaurantCard.jsx";

export default function RestaurantsPage({ onSelectRestaurant, userRole }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All Cuisines");

  // Add Restaurant Modal State
  const [showAddModal, setShowShowAddModal] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisine: "",
    address: "",
    phone_number: "",
    operating_hours: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await restaurantService.getRestaurants();
      setRestaurants(data);
    } catch (err) {
      setError("Failed to load partner restaurants. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const created = await restaurantService.createRestaurant(newRestaurant);
      setRestaurants([...restaurants, created]);
      setShowShowAddModal(false);
      setNewRestaurant({
        name: "",
        cuisine: "",
        address: "",
        phone_number: "",
        operating_hours: "",
      });
    } catch (err) {
      setAddError(err.response?.data?.detail || "Failed to add restaurant.");
    } finally {
      setAddLoading(false);
    }
  };

  // Filter restaurants based on search and cuisine
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.cuisine && r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCuisine =
      selectedCuisine === "All Cuisines" ||
      (r.cuisine && r.cuisine.toLowerCase() === selectedCuisine.toLowerCase());
    return matchesSearch && matchesCuisine;
  });

  // Get unique cuisines for filter dropdown
  const cuisines = [
    "All Cuisines",
    ...new Set(restaurants.map((r) => r.cuisine).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Restaurant Directory
          </h2>
          <p className="text-sm text-gray-500">
            Manage partner restaurants and place guest orders
          </p>
        </div>
        {(userRole === "Administrator" || userRole === "Manager") && (
          <button
            onClick={() => setShowShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Restaurant
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or cuisine..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            {cuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          More Filters
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500 font-medium">
            Loading restaurants...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-3 max-w-2xl mx-auto shadow-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Error Loading Restaurants</p>
            <p className="mt-0.5">{error}</p>
            <button
              onClick={fetchRestaurants}
              className="mt-2 text-xs font-bold underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 font-medium">
            No restaurants match your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onViewMenu={onSelectRestaurant}
            />
          ))}
        </div>
      )}

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Add Partner Restaurant
              </h3>
              <button
                onClick={() => setShowShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRestaurant} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={newRestaurant.name}
                  onChange={(e) =>
                    setNewRestaurant({ ...newRestaurant, name: e.target.value })
                  }
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={newRestaurant.cuisine}
                  onChange={(e) =>
                    setNewRestaurant({
                      ...newRestaurant,
                      cuisine: e.target.value,
                    })
                  }
                  placeholder="E.g., Italian, Asian, Mexican"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={newRestaurant.address}
                  onChange={(e) =>
                    setNewRestaurant({
                      ...newRestaurant,
                      address: e.target.value,
                    })
                  }
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newRestaurant.phone_number}
                  onChange={(e) =>
                    setNewRestaurant({
                      ...newRestaurant,
                      phone_number: e.target.value,
                    })
                  }
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={newRestaurant.operating_hours}
                  onChange={(e) =>
                    setNewRestaurant({
                      ...newRestaurant,
                      operating_hours: e.target.value,
                    })
                  }
                  placeholder="E.g., 11:00 AM - 10:00 PM"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {addLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Restaurant"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
