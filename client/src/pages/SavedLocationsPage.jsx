import React, { useState, useEffect } from "react";
import { locationsApi } from "../services/api";
import SavedLocationCard from "../components/weather/SavedLocationCard";
import LoadingBox from "../components/common/LoadingBox";
import ErrorBox from "../components/common/ErrorBox";

export default function SavedLocationsPage({ onSelectLocation }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await locationsApi.list();
      setLocations(data);
    } catch (err) {
      setError("Failed to load saved locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSetDefault = async (id) => {
    try {
      await locationsApi.setDefault(id);
      fetchLocations();
    } catch (err) {
      setError("Failed to set default location.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await locationsApi.delete(id);
      fetchLocations();
    } catch (err) {
      setError("Failed to delete location.");
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await locationsApi.create({
        name: newName.trim(),
        country: newCountry.trim() || null,
        is_default: locations.length === 0,
      });
      setNewName("");
      setNewCountry("");
      fetchLocations();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to add location. It might already be saved.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingBox message="Loading saved locations..." />;
  }

  return (
    <div className="col-span-12 bg-surface-container-high rounded-lg border border-outline-variant p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            location_on
          </span>
          Saved Locations
        </h2>
      </div>

      {error && (
        <div className="mb-6 text-error bg-error/10 border border-error/20 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Add Location Form */}
      <form
        onSubmit={handleAddLocation}
        className="mb-8 bg-surface-container p-4 rounded-lg border border-outline-variant/50 flex flex-col md:flex-row gap-4 items-end"
      >
        <div className="flex-1 w-full">
          <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase">
            City Name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Paris"
            required
            className="w-full bg-surface-container-high border border-outline-variant text-on-surface placeholder-on-surface-variant rounded-md px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm transition-colors outline-none"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase">
            Country Code (Optional)
          </label>
          <input
            type="text"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            placeholder="e.g. FR"
            className="w-full bg-surface-container-high border border-outline-variant text-on-surface placeholder-on-surface-variant rounded-md px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm transition-colors outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-6 py-2 bg-primary text-on-primary hover:bg-primary-fixed-dim disabled:opacity-50 rounded-md transition-colors font-body-sm font-semibold"
        >
          {isSubmitting ? "Adding..." : "Add Location"}
        </button>
      </form>

      {/* Locations List */}
      {locations.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant font-body-sm">
          No saved locations yet. Search and favorite a location on the
          dashboard or add one above!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {locations.map((loc) => (
            <SavedLocationCard
              key={loc.id}
              location={loc}
              onSelect={onSelectLocation}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
