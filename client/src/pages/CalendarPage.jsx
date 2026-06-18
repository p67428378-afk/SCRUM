import React, { useState, useEffect } from "react";
import CalendarGrid from "../components/calendar/CalendarGrid";
import AvailabilityControlPanel from "../components/calendar/AvailabilityControlPanel";
import Header from "../components/layout/Header";
import { availabilityService } from "../services/api";

export default function CalendarPage() {
  const [availability, setAvailability] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailability = async () => {
    try {
      const data = await availabilityService.getAvailability();
      setAvailability(data);
    } catch (err) {
      console.error("Failed to fetch availability", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleDateSelect = (dateStr) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr],
    );
  };

  const handleSaveAvailability = async (dates, isAvailable, notes) => {
    try {
      await availabilityService.setAvailability(dates, isAvailable, notes);
      await fetchAvailability();
      setSelectedDates([]);
    } catch (err) {
      console.error("Failed to save availability", err);
    }
  };

  const handleClearSelection = () => {
    setSelectedDates([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      <div className="pt-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-on-surface mb-2">
            Availability Calendar
          </h2>
          <p className="text-on-surface-variant text-sm">
            Manage your trekking schedule and block out unavailable dates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <CalendarGrid
              availability={availability}
              onDateSelect={handleDateSelect}
              selectedDates={selectedDates}
            />
          </div>
          <div>
            <AvailabilityControlPanel
              selectedDates={selectedDates}
              onSave={handleSaveAvailability}
              onClearSelection={handleClearSelection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
