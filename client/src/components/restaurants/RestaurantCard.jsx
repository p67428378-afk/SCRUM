import React from "react";
import { Star, Clock, Phone, MapPin } from "lucide-react";

export default function RestaurantCard({
  restaurant,
  onViewMenu,
  onEditDetail,
}) {
  // Simple rating generator based on name length or default
  const rating = ((restaurant.name.length % 10) / 10 + 4.0).toFixed(1);
  const priceLevel =
    restaurant.cuisine?.length % 3 === 0
      ? "$$$"
      : restaurant.cuisine?.length % 3 === 1
        ? "$$"
        : "$";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col hover:shadow-lg transition-all duration-200">
      <div className="h-40 bg-indigo-100 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
        <span className="text-4xl font-bold text-indigo-600 uppercase tracking-wider">
          {restaurant.name.substring(0, 2)}
        </span>
        <div className="absolute top-3 right-3">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Open
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 truncate max-w-[75%]">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-bold">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
          <span>{restaurant.cuisine || "General"}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="font-semibold text-indigo-600">{priceLevel}</span>
        </div>

        <div className="space-y-2 mb-5 flex-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <span>{restaurant.operating_hours || "11:00 AM - 10:00 PM"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <span>{restaurant.phone_number || "(555) 123-4567"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0" />
            <span className="truncate">
              {restaurant.address || "Hotel Partner"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewMenu(restaurant)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition-colors text-center text-xs"
          >
            View Menu
          </button>
          <button
            onClick={() => onEditDetail && onEditDetail(restaurant)}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-semibold transition-colors text-center text-xs"
          >
            Edit Detail
          </button>
        </div>
      </div>
    </div>
  );
}
