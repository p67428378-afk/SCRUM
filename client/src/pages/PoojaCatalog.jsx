import React, { useState, useEffect } from "react";
import { poojaAPI } from "../services/api";
import {
  Flame,
  Clock,
  IndianRupee,
  Calendar,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Filter,
} from "lucide-react";

export default function PoojaCatalog({ onSelectPoojaSlot }) {
  const [poojas, setPoojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPooja, setSelectedPooja] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchPoojas();
  }, []);

  const fetchPoojas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await poojaAPI.listPoojas();
      setPoojas(data);
      if (data.length > 0) {
        setSelectedPooja(data[0]);
      }
    } catch (err) {
      setError(
        "Failed to load Pooja catalog. Please make sure the backend API is accessible.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPooja) {
      fetchSlots(selectedPooja.id, selectedDate);
    }
  }, [selectedPooja, selectedDate]);

  const fetchSlots = async (poojaId, date) => {
    setLoadingSlots(true);
    try {
      const slotData = await poojaAPI.listSlots(poojaId, date);
      setSlots(slotData);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 text-9xl select-none pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          🔱
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-600/40 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Devotee Pooja & Seva Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Shivji Poojas & Sacred Seva Booking
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Reserve your divine slots for Rudrabhishekam, Mahadev Aarti,
            Bilvarchana, and special Mahadev Sevas with real-time availability
            and Sankalpam registration.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin text-3xl mb-2 text-amber-700">
            🔱
          </div>
          <p className="text-gray-600 font-medium text-sm">
            Loading divine Pooja catalog...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
          <p className="font-semibold mb-2">{error}</p>
          <button
            onClick={fetchPoojas}
            className="mt-2 bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber-800"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Pooja Seva List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" /> Available Sevas &
                Poojas
              </h2>
              <span className="text-xs text-amber-700 font-semibold bg-amber-100 px-2.5 py-1 rounded-full">
                {poojas.length} Active Rituals
              </span>
            </div>

            <div className="space-y-4">
              {poojas.map((pooja) => {
                const isSelected = selectedPooja?.id === pooja.id;
                return (
                  <div
                    key={pooja.id}
                    onClick={() => setSelectedPooja(pooja)}
                    className={`cursor-pointer transition-all rounded-2xl p-5 border ${
                      isSelected
                        ? "bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                        : "bg-white border-gray-200 hover:border-amber-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {pooja.title}
                          </h3>
                          {isSelected && (
                            <span className="bg-amber-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {pooja.description ||
                            "Sacred Shivji Seva conducted by chief temple priests with holy rituals."}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end text-lg font-extrabold text-amber-800">
                          <IndianRupee className="w-4 h-4 mt-0.5" />
                          <span>{pooja.price}</span>
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {pooja.duration_minutes} mins
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slot Selector & Sankalpam Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-2xl border border-amber-200 shadow-lg p-6 space-y-6">
              {selectedPooja ? (
                <>
                  <div className="border-b border-amber-100 pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
                      Select Date & Real-time Slot
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">
                      {selectedPooja.title}
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5 font-medium">
                      Dakshina: ₹{selectedPooja.price} • Duration:{" "}
                      {selectedPooja.duration_minutes} mins
                    </p>
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" /> Choose
                      Booking Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                    />
                  </div>

                  {/* Available Slots */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Available Time Slots
                    </label>

                    {loadingSlots ? (
                      <div className="py-8 text-center text-xs text-gray-500">
                        Checking slot capacity...
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 text-center text-xs text-amber-800">
                        No slots scheduled for this date. Please select another
                        date.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 pb-1">
                        {slots.map((slot) => {
                          const available =
                            slot.max_capacity - slot.booked_count;
                          const isFull = available <= 0;
                          return (
                            <div
                              key={slot.id}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                                isFull
                                  ? "bg-gray-100 border-gray-200 opacity-60"
                                  : "bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50/50"
                              }`}
                            >
                              <div>
                                <span className="font-bold text-gray-900 block text-sm">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                                <span className="text-gray-500">
                                  Capacity: {slot.booked_count}/
                                  {slot.max_capacity}
                                </span>
                              </div>

                              <div>
                                {isFull ? (
                                  <span className="text-red-600 font-semibold px-2 py-1 bg-red-50 rounded">
                                    Full
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      onSelectPoojaSlot(selectedPooja, slot)
                                    }
                                    className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition text-xs shadow-xs"
                                  >
                                    Book Slot{" "}
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-gray-500 text-xs">
                  Please select a Pooja from the catalog list to view slots.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
