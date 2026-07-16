import React, { useState } from "react";
import RoomCard from "../components/rooms/RoomCard.jsx";
import { Filter, Plus, AlertCircle } from "lucide-react";

export default function RoomsPage({ rooms, onStatusChange, userRole }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesStatus =
      statusFilter === "All" || room.status === statusFilter;
    const matchesType = typeFilter === "All" || room.type === typeFilter;
    return matchesStatus && matchesType;
  });

  // Get unique room types for filter dropdown
  const roomTypes = ["All", ...new Set(rooms.map((r) => r.type))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Room Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View, filter, and update real-time room statuses.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2 text-gray-500 text-sm font-semibold mr-2">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[140px]"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Dirty">Dirty</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Room Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[140px]"
            >
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Types" : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onStatusChange={onStatusChange}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 flex flex-col items-center justify-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            No Rooms Found
          </h3>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or add new rooms to the system.
          </p>
        </div>
      )}
    </div>
  );
}
