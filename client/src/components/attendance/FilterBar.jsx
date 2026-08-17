import React, { useState } from "react";
import { Filter, RotateCcw } from "lucide-react";

export default function FilterBar({ onFilter, onReset }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");

  const handleApply = (e) => {
    e.preventDefault();
    onFilter({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      status: status || undefined,
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStatus("");
    onReset();
  };

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-5 shadow-sm w-full">
      <h3 className="text-[#171c29] font-bold text-base mb-4 flex items-center space-x-2">
        <Filter className="w-4 h-4 text-[#2663eb]" />
        <span>Attendance Record Filters</span>
      </h3>

      <form
        onSubmit={handleApply}
        className="flex flex-col md:flex-row items-end justify-between gap-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto flex-1">
          <div className="flex flex-col gap-1">
            <label className="text-[#707a8c] font-medium text-xs">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#f2f5fa] border border-[#e3e8f0] text-[#171c29] text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-[#2663eb] focus:outline-none w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[#707a8c] font-medium text-xs">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#f2f5fa] border border-[#e3e8f0] text-[#171c29] text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-[#2663eb] focus:outline-none w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[#707a8c] font-medium text-xs">
              Status Filter
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-[#f2f5fa] border border-[#e3e8f0] text-[#171c29] text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-[#2663eb] focus:outline-none w-full"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Half-Day">Half-Day</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button
            type="submit"
            className="bg-[#2663eb] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <span>Apply Filters</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-white border border-[#e3e8f0] text-[#171c29] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4 text-[#707a8c]" />
            <span>Reset</span>
          </button>
        </div>
      </form>
    </div>
  );
}
