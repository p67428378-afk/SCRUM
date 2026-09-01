import React from "react";
import { Link } from "react-router-dom";
import { Heart, Bed, Bath, Square, MapPin } from "lucide-react";

export default function PropertyCard({
  property,
  isFavorite = false,
  onToggleFavorite,
}) {
  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0].image_url
      : "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80";

  const statusColors = {
    Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Sold: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute top-3 left-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[property.status] || "bg-slate-100 text-slate-800"}`}
          >
            {property.status || "Active"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (onToggleFavorite) onToggleFavorite(property.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500 backdrop-blur-sm shadow-sm transition"
          title={isFavorite ? "Remove from favorites" : "Save to favorites"}
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
          />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-2xl font-bold text-blue-600">
              ${Number(property.price || 0).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-400 capitalize">
              {property.property_type || "Single Family"}
            </span>
          </div>

          <Link
            to={`/properties/${property.id}`}
            className="block hover:text-blue-600 transition"
          >
            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
              {property.title}
            </h3>
          </Link>

          <p className="text-slate-500 text-xs flex items-center space-x-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">
              {property.address_street}, {property.city}, {property.state}{" "}
              {property.zip_code}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 text-center text-xs font-semibold text-slate-700">
          <div className="flex items-center justify-center space-x-1">
            <Bed className="w-4 h-4 text-slate-400" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center justify-center space-x-1 border-x border-slate-100">
            <Bath className="w-4 h-4 text-slate-400" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <Square className="w-4 h-4 text-slate-400" />
            <span>{property.square_feet?.toLocaleString()} sqft</span>
          </div>
        </div>

        <Link
          to={`/properties/${property.id}`}
          className="w-full text-center bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold py-2 rounded-xl text-xs transition"
        >
          View Property Details
        </Link>
      </div>
    </div>
  );
}
