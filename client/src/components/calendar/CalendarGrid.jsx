import React, { useState } from "react";

export default function CalendarGrid({
  availability = [],
  onDateSelect,
  selectedDates = [],
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const formatDateString = (day) => {
    const d = new Date(year, month, day);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  const getAvailabilityForDate = (dateStr) => {
    return availability.find((a) => a.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-on-surface">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-xs font-bold text-on-surface-variant uppercase tracking-wider py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dateStr = formatDateString(day);
          const avail = getAvailabilityForDate(dateStr);
          const isSelected = selectedDates.includes(dateStr);

          let bgClass =
            "bg-surface-container-low hover:bg-surface-container-high";
          let borderClass = "border border-outline-variant/30";
          let textClass = "text-on-surface";

          if (avail) {
            if (avail.is_available) {
              bgClass = "bg-primary/10 hover:bg-primary/20";
              borderClass = "border border-primary/40";
              textClass = "text-primary font-bold";
            } else {
              bgClass = "bg-error/10 hover:bg-error/20";
              borderClass = "border border-error/40";
              textClass = "text-error font-bold";
            }
          }

          if (isSelected) {
            borderClass = "border-2 border-secondary";
          }

          return (
            <button
              key={day}
              onClick={() => onDateSelect && onDateSelect(dateStr)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all relative ${bgClass} ${borderClass} ${textClass}`}
            >
              <span className="text-sm font-semibold">{day}</span>
              {avail && avail.notes && (
                <span className="text-[9px] text-on-surface-variant truncate max-w-full px-1 mt-1">
                  {avail.notes}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs justify-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40" />
          <span className="text-on-surface-variant">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-error/20 border border-error/40" />
          <span className="text-on-surface-variant">Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-surface-container-low border border-outline-variant/30" />
          <span className="text-on-surface-variant">Not Set</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-secondary" />
          <span className="text-on-surface-variant">Selected</span>
        </div>
      </div>
    </div>
  );
}
