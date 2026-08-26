import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Award, ShieldCheck, Heart } from "lucide-react";

export default function ListingCard({ listing }) {
  const {
    id,
    title,
    breed,
    age_months,
    price,
    location,
    photo_urls,
    health_records,
    seller,
    status = "available",
  } = listing;

  const defaultPhoto =
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80";
  const imageUrl =
    photo_urls && photo_urls.length > 0 ? photo_urls[0] : defaultPhoto;

  const formatAge = (months) => {
    if (!months && months !== 0) return "Age unknown";
    if (months < 12) return `${months} mo`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0
      ? `${years}y ${rem}m`
      : `${years} ${years === 1 ? "yr" : "yrs"}`;
  };

  return (
    <div className="bg-white rounded-xl border border-[#e3e8f0] overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col h-full group">
      {/* Image container */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.src = defaultPhoto;
          }}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
          ${price?.toLocaleString()}
        </div>
        <div className="absolute top-3 left-3 flex gap-1">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold text-white uppercase tracking-wide ${
              status === "available" ? "bg-secondary" : "bg-warning"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-base text-textPrimary group-hover:text-primary transition line-clamp-1">
              {title}
            </h3>
          </div>

          <p className="text-xs font-semibold text-primary/80 mb-2">{breed}</p>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-textMuted mb-2">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-accent" />
              {formatAge(age_months)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {location || "Location unspecified"}
            </span>
          </div>

          {health_records && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md mb-2 line-clamp-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{health_records}</span>
            </div>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="pt-2 border-t border-[#e3e8f0] flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-xs text-textMuted">
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
            <span className="font-semibold text-textPrimary">
              {seller?.seller_rating ? seller.seller_rating.toFixed(1) : "5.0"}
            </span>
            <span className="text-[11px]">
              ({seller?.full_name || "Seller"})
            </span>
          </div>

          <Link
            to={`/listings/${id}`}
            className="px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-semibold rounded-lg transition duration-150"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
