import React from "react";
import { Clock, Coffee, Scissors } from "lucide-react";

export default function StaffTimeline({ staffList = [], appointments = [] }) {
  const hours = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const defaultStaff =
    staffList.length > 0
      ? staffList
      : [
          { id: "stf-1", full_name: "Sarah Jenkins" },
          { id: "stf-2", full_name: "Elena Rostova" },
          { id: "stf-3", full_name: "Marcus Chen" },
        ];

  const isLunchBreak = (hour) => hour === "12:00" || hour === "13:00";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-6 space-y-6">
      <div className="border-b border-rose-100 pb-4">
        <h2 className="text-xl font-serif font-bold text-[#5B1D2E] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#B87D7E]" />
          Daily Staff Schedule & Shift Timeline
        </h2>
        <p className="text-sm text-[#534345]">
          Multi-track visual schedule highlighting shift hours, scheduled
          bookings, and meal breaks.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-[#534345]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          <span>Booked Appointment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-200 border border-amber-300 rounded-sm"></div>
          <span>Lunch Break (12:30 - 13:30)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rose-50 border border-rose-100 rounded-sm"></div>
          <span>Available Working Shift</span>
        </div>
      </div>

      {/* Grid Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Row: Hours */}
          <div className="grid grid-cols-10 border-b border-rose-200 pb-2 text-xs font-semibold text-[#534345]">
            <div className="col-span-1">Stylist / Staff</div>
            {hours.map((hr) => (
              <div key={hr} className="text-center">
                {hr}
              </div>
            ))}
          </div>

          {/* Staff Rows */}
          <div className="divide-y divide-rose-100">
            {defaultStaff.map((staff) => (
              <div
                key={staff.id}
                className="grid grid-cols-10 items-center py-3"
              >
                <div className="col-span-1 font-medium text-xs text-[#151C24] pr-2 truncate">
                  {staff.full_name}
                </div>

                {hours.map((hour, idx) => {
                  const lunch = hour === "12:00" || hour === "13:00";
                  // Check if staff has appointment during this hour
                  const hasBooking = appointments.some((apt) => {
                    if (
                      apt.staff_id !== staff.id &&
                      apt.staff_name !== staff.full_name
                    )
                      return false;
                    const aptTime = apt.start_time
                      ? new Date(apt.start_time).getUTCHours()
                      : null;
                    const hrNum = parseInt(hour.split(":")[0], 10);
                    return aptTime === hrNum && apt.status !== "cancelled";
                  });

                  return (
                    <div key={hour} className="px-1 py-1">
                      {hasBooking ? (
                        <div className="h-9 bg-emerald-600 text-white rounded text-[10px] font-semibold flex items-center justify-center gap-1 shadow-sm px-1">
                          <Scissors className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Booked</span>
                        </div>
                      ) : lunch ? (
                        <div className="h-9 bg-amber-100 border border-amber-300 text-[#9E6038] rounded text-[10px] font-medium flex items-center justify-center gap-1">
                          <Coffee className="w-3 h-3" />
                          <span className="hidden md:inline">Break</span>
                        </div>
                      ) : (
                        <div className="h-9 bg-rose-50/70 border border-rose-100 rounded text-[10px] text-gray-400 flex items-center justify-center hover:bg-rose-100/50 transition-colors">
                          Shift
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
