import React from "react";
import Button from "../common/Button.jsx";

export default function AvailableFacilitiesList({
  facilities = [],
  onBookClick,
}) {
  return (
    <div className="card-surface p-6 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">
        Available Facilities
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {facilities.length === 0 ? (
          <p className="text-slate-400 text-sm col-span-3">
            No facilities available.
          </p>
        ) : (
          facilities.map((facility) => (
            <div
              key={facility.id}
              className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <h4 className="text-base font-semibold text-slate-200">
                  {facility.name}
                </h4>
                <p className="text-xs text-slate-400">
                  Capacity: {facility.capacity} people
                </p>
                <p className="text-sm text-slate-300 mt-2">
                  {facility.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
                <span className="text-sm font-bold text-emerald-400">
                  {parseFloat(facility.rate) === 0
                    ? "Free"
                    : `$${parseFloat(facility.rate).toFixed(2)} / hr`}
                </span>
                <Button
                  onClick={() => onBookClick(facility)}
                  variant="outline"
                  className="px-3 py-1.5 text-xs"
                >
                  Book Now
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
