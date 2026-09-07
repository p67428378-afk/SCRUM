import React, { useState } from "react";
import { X, MapPin, AlertCircle } from "lucide-react";
import { createLocation } from "../../services/api";

export default function StationFormModal({
  isOpen,
  onClose,
  onStationCreated,
}) {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    country: "",
    latitude: "",
    longitude: "",
    elevation_meters: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90 degrees.");
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError("Longitude must be between -180 and 180 degrees.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        latitude: lat,
        longitude: lon,
        elevation_meters: formData.elevation_meters
          ? parseFloat(formData.elevation_meters)
          : 0,
      };
      await createLocation(payload);
      onStationCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to register station. Please check input parameters.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#171F33] border border-[#3C494E] rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#3C494E]">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#00D1FF]" />
            <h3 className="text-lg font-bold text-white">
              Register Weather Monitoring Station
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#BBC9CF] hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-xs font-mono text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-[#BBC9CF] mb-1 font-semibold">
              Station Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. San Francisco Bay Observatory"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D1FF]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#BBC9CF] mb-1 font-semibold">
                City
              </label>
              <input
                type="text"
                placeholder="San Francisco"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D1FF]"
              />
            </div>
            <div>
              <label className="block text-[#BBC9CF] mb-1 font-semibold">
                State / Region
              </label>
              <input
                type="text"
                placeholder="CA"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D1FF]"
              />
            </div>
            <div>
              <label className="block text-[#BBC9CF] mb-1 font-semibold">
                Country
              </label>
              <input
                type="text"
                placeholder="USA"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00D1FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#BBC9CF] mb-1 font-semibold">
                Latitude (-90 to 90) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="37.7749"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-[#00D1FF]"
              />
            </div>
            <div>
              <label className="block text-[#BBC9CF] mb-1 font-semibold">
                Longitude (-180 to 180) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="-122.4194"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-[#00D1FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#BBC9CF] mb-1 font-semibold">
              Elevation (Meters)
            </label>
            <input
              type="number"
              step="any"
              placeholder="16"
              value={formData.elevation_meters}
              onChange={(e) =>
                setFormData({ ...formData, elevation_meters: e.target.value })
              }
              className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-[#00D1FF]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#3C494E]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#222A3D] text-[#BBC9CF] hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#00D1FF] hover:bg-[#4CDEFF] text-black font-semibold rounded-lg transition"
            >
              {submitting ? "Registering..." : "Register Station"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
