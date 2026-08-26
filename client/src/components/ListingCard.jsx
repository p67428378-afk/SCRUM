import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Award, ShieldCheck } from "lucide-react";

const FALLBACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23f3f4f6"><rect width="100%" height="100%" fill="%23e5e7eb"/><path d="M300 160c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm-70 10c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm140 0c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm-110 80c-25 0-48 12-60 30 15 20 40 32 70 32s55-12 70-32c-12-18-35-30-60-30z" fill="%239ca3af"/><text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="%236b7280">Dog Photo</text></svg>`;

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80";

const BREED_PHOTOS = {
  "german shepherd":
    "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80",
  "golden retriever":
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
  "french bulldog":
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
  poodle:
    "https://images.unsplash.com/photo-1605244863941-3a3ed921c60d?auto=format&fit=crop&w=600&q=80",
  beagle:
    "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
  labrador:
    "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=600&q=80",
};

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

  const validPhotos = Array.isArray(photo_urls)
    ? photo_urls.filter(
        (url) => typeof url === "string" && url.trim().length > 0,
      )
    : typeof photo_urls === "string" && photo_urls.trim().length > 0
      ? [photo_urls.trim()]
      : [];

  const normalizedBreed = breed ? breed.toLowerCase().trim() : "";
  const breedMatch = Object.keys(BREED_PHOTOS).find((b) =>
    normalizedBreed.includes(b),
  );
  const breedFallback = breedMatch ? BREED_PHOTOS[breedMatch] : DEFAULT_PHOTO;

  const imageUrl = validPhotos.length > 0 ? validPhotos[0] : breedFallback;

  const handleImageError = (e) => {
    if (e.target.dataset.fallbackStep === "1") {
      e.target.dataset.fallbackStep = "2";
      e.target.src = FALLBACK_SVG;
    } else if (!e.target.dataset.fallbackStep) {
      e.target.dataset.fallbackStep = "1";
      e.target.src = breedFallback !== imageUrl ? breedFallback : FALLBACK_SVG;
    }
  };

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
          onError={handleImageError}
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
