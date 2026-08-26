import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { listingsService, authService } from "../services/api";
import InquiryModal from "../components/InquiryModal";
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  Award,
  DollarSign,
  MessageSquare,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listingsService.getListing(id);
        setListing(data);
      } catch (err) {
        console.error("Failed to fetch listing detail:", err);
        setError("Dog listing not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="bg-gray-200 h-8 w-32 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-80 rounded-xl"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
            <div className="bg-gray-200 h-24 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-[#e3e8f0] text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-red-600">Listing Not Found</h2>
        <p className="text-xs text-textMuted">
          {error || "The requested dog profile could not be retrieved."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const defaultPhoto =
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80";
  const validPhotos = Array.isArray(listing.photo_urls)
    ? listing.photo_urls.filter(
        (url) => typeof url === "string" && url.trim().length > 0,
      )
    : [];
  const photos = validPhotos.length > 0 ? validPhotos : [defaultPhoto];

  const formatAge = (months) => {
    if (!months && months !== 0) return "Age unknown";
    if (months < 12) return `${months} months old`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0
      ? `${years} years ${rem} months old`
      : `${years} ${years === 1 ? "year" : "years"} old`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>
      </div>

      {/* Main Grid: Left Photos, Right Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Photo Gallery */}
        <div className="space-y-3">
          <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-gray-100 border border-[#e3e8f0] shadow-sm">
            <img
              src={photos[activePhoto] || defaultPhoto}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (e.target.src !== defaultPhoto) {
                  e.target.onerror = null;
                  e.target.src = defaultPhoto;
                }
              }}
            />
            <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {listing.status || "Available"}
            </div>
          </div>

          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                    activePhoto === idx
                      ? "border-primary shadow-sm"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.target.src !== defaultPhoto) {
                        e.target.onerror = null;
                        e.target.src = defaultPhoto;
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listing Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e3e8f0] shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-2xl font-extrabold text-textPrimary">
                  {listing.title}
                </h1>
                <span className="text-2xl font-extrabold text-primary">
                  ${listing.price?.toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-semibold text-primary/90 mt-1">
                {listing.breed}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 py-3 border-y border-[#e3e8f0] text-xs font-medium text-textMuted">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-accent" />
                <span>{formatAge(listing.age_months)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{listing.location || "Location Not Specified"}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">
                About This Dog
              </h3>
              <p className="text-xs sm:text-sm text-textPrimary leading-relaxed whitespace-pre-line">
                {listing.description || "No description provided."}
              </p>
            </div>

            {/* Health & Certification */}
            <div className="bg-[#f2f5fa] p-4 rounded-xl space-y-2 border border-[#e3e8f0]">
              <div className="flex items-center gap-2 text-xs font-bold text-textPrimary">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <span>Health Records & Clearances</span>
              </div>
              <p className="text-xs text-textMuted">
                {listing.health_records ||
                  "Vaccinations up-to-date, AKC registration pending."}
              </p>
            </div>

            {/* Seller Info */}
            <div className="p-4 bg-gray-50 rounded-xl border border-[#e3e8f0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-textPrimary">
                    {listing.seller?.full_name || "Verified Seller"}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-textMuted">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span>
                      {listing.seller?.seller_rating
                        ? listing.seller.seller_rating.toFixed(1)
                        : "5.0"}{" "}
                      Rating
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-blue-100 text-primary px-2 py-0.5 rounded-full font-semibold">
                Verified
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-[#e3e8f0]">
            <button
              onClick={() => setIsInquiryOpen(true)}
              className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Seller / Inquire
            </button>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        listing={listing}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
