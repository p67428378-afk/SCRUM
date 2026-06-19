import React, { useState, useEffect } from "react";
import DashboardPage from "./pages/DashboardPage";
import SavedLocationsPage from "./pages/SavedLocationsPage";
import SearchBar from "./components/weather/SearchBar";
import { locationsApi } from "./services/api";

export default function App() {
  const [unit, setUnit] = useState("C");
  const [activeLocation, setActiveLocation] = useState("");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from local storage
  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (locationName) => {
    setActiveLocation(locationName);
    setCurrentPage("dashboard");

    // Update recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== locationName.toLowerCase(),
      );
      const updated = [locationName, ...filtered].slice(0, 5);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelectRecent = (locationName) => {
    setActiveLocation(locationName);
    setCurrentPage("dashboard");
  };

  return (
    <div className="bg-background text-on-surface min-h-screen antialiased flex">
      {/* SideNavBar */}
      <nav className="fixed left-0 top-0 h-full w-[260px] bg-surface-container border-r border-outline-variant flex flex-col py-8 z-20">
        <div className="px-6 mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">
            filter_drama
          </span>
          <h1 className="font-headline-md text-headline-md text-primary">
            SkyWatch Pro
          </h1>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className={`flex items-center gap-3 px-4 py-2 transition-colors text-left w-full ${
              currentPage === "dashboard"
                ? "text-primary border-l-4 border-primary bg-primary/10"
                : "text-on-surface-variant hover:bg-surface-container-highest opacity-80"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  currentPage === "dashboard" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              dashboard
            </span>
            <span className="font-body-lg text-body-lg">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentPage("saved-locations")}
            className={`flex items-center gap-3 px-4 py-2 transition-colors text-left w-full ${
              currentPage === "saved-locations"
                ? "text-primary border-l-4 border-primary bg-primary/10"
                : "text-on-surface-variant hover:bg-surface-container-highest opacity-80"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings:
                  currentPage === "saved-locations" ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              location_on
            </span>
            <span className="font-body-lg text-body-lg">Saved Locations</span>
          </button>
        </div>

        {recentSearches.length > 0 && (
          <div className="px-6 mt-auto mb-8">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase">
              Recent Searches
            </h3>
            <div className="flex flex-col gap-3">
              {recentSearches.map((search, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectRecent(search)}
                  className="flex items-center gap-3 text-on-surface-variant hover:text-primary cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    history
                  </span>
                  <span className="font-body-sm text-body-sm">{search}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 mt-auto">
          <button className="w-full bg-primary-container text-on-primary-container font-body-sm text-body-sm font-semibold py-2 rounded-md hover:bg-primary transition-colors">
            Upgrade to Premium
          </button>
        </div>
      </nav>

      {/* Main Wrapper */}
      <div className="pl-sidebar-width flex flex-col min-h-screen flex-1">
        {/* TopAppBar */}
        <header className="fixed top-0 right-0 h-[64px] left-[260px] bg-surface flex justify-between items-center px-margin-desktop border-b border-outline-variant z-10">
          <SearchBar onSearch={handleSearch} />

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-surface-container-high rounded-full p-1 border border-outline-variant">
              <button
                onClick={() => setUnit("C")}
                className={`px-3 py-1 rounded-full font-label-caps text-label-caps transition-colors ${
                  unit === "C"
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit("F")}
                className={`px-3 py-1 rounded-full font-label-caps text-label-caps transition-colors ${
                  unit === "F"
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                °F
              </button>
            </div>

            <button className="relative text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
            </button>

            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                AJ
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 mt-header-height p-margin-desktop flex flex-col items-center justify-start">
          {currentPage === "dashboard" ? (
            <DashboardPage
              unit={unit}
              activeLocation={activeLocation}
              setActiveLocation={setActiveLocation}
            />
          ) : (
            <SavedLocationsPage onSelectLocation={handleSearch} />
          )}
        </main>
      </div>
    </div>
  );
}
