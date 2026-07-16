import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  DollarSign,
  Users,
} from "lucide-react";

export default function RoomCard({ room, onStatusChange, userRole }) {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Available":
        return {
          bg: "bg-green-50 border-green-200",
          badge: "bg-green-100 text-green-800",
          icon: CheckCircle,
          iconColor: "text-green-600",
        };
      case "Occupied":
        return {
          bg: "bg-blue-50 border-blue-200",
          badge: "bg-blue-100 text-blue-800",
          icon: Users,
          iconColor: "text-blue-600",
        };
      case "Dirty":
        return {
          bg: "bg-amber-50 border-amber-200",
          badge: "bg-amber-100 text-amber-800",
          icon: AlertTriangle,
          iconColor: "text-amber-600",
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200",
          badge: "bg-gray-100 text-gray-800",
          icon: HelpCircle,
          iconColor: "text-gray-600",
        };
    }
  };

  const styles = getStatusStyles(room.status);
  const StatusIcon = styles.icon;

  return (
    <div
      className={`border rounded-xl p-5 shadow-sm transition-all hover:shadow-md bg-white flex flex-col justify-between`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {room.type}
            </span>
            <h3 className="text-lg font-bold text-gray-900">
              Room {room.room_number}
            </h3>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}
          >
            {room.status}
          </span>
        </div>

        <div className="space-y-2 my-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            <span>
              Capacity: {room.capacity}{" "}
              {room.capacity === 1 ? "Guest" : "Guests"}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
            <span>
              Price:{" "}
              <strong className="text-gray-900">${room.price_per_night}</strong>{" "}
              / night
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mt-2">
        <label className="block text-xs font-semibold text-gray-500 mb-2">
          Update Status
        </label>
        <select
          value={room.status}
          onChange={(e) => onStatusChange(room.id, e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Dirty">Dirty</option>
        </select>
      </div>
    </div>
  );
}
