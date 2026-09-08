import React from "react";
import { Calendar, Users, DollarSign, Clock, ShieldAlert } from "lucide-react";

export default function FacilityCardGrid({ facilities = [], onBookFacility }) {
  if (!facilities || facilities.length === 0) {
    // Default fallback mock facilities if backend list is empty initially
    facilities = [
      {
        id: "fac-1",
        name: "Community Hall",
        description:
          "Spacious air-conditioned hall for events, banquets, and village meetings.",
        capacity: 200,
        hourly_rate: 50,
        is_active: true,
      },
      {
        id: "fac-2",
        name: "Sports Complex & Tennis Court",
        description:
          "Outdoor floodlit courts for tennis, pickleball, and basketball games.",
        capacity: 30,
        hourly_rate: 25,
        is_active: true,
      },
      {
        id: "fac-3",
        name: "Village Swimming Pool & Pavilion",
        description:
          "Olympic-sized pool with sun deck, poolside lounge, and BBQ pits.",
        capacity: 50,
        hourly_rate: 35,
        is_active: true,
      },
      {
        id: "fac-4",
        name: "Conference & Meeting Room B",
        description:
          "Executive board room equipped with projector, high-speed WiFi, and AV system.",
        capacity: 15,
        hourly_rate: 20,
        is_active: true,
      },
    ];
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {facilities.map((fac) => (
        <div
          key={fac.id}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-slate-900">{fac.name}</h3>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {fac.hourly_rate ? `$${fac.hourly_rate}/hr` : "Free"}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {fac.description || "No description provided."}
            </p>

            <div className="flex items-center space-x-4 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-lg">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Capacity: <strong>{fac.capacity || "N/A"}</strong> people
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Slot: <strong>1 Hour min</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onBookFacility && onBookFacility(fac)}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Facility Slot</span>
          </button>
        </div>
      ))}
    </div>
  );
}
