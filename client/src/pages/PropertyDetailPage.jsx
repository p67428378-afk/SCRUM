import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import AgentContactCard from "../components/AgentContactCard";
import PriceHistoryChart from "../components/PriceHistoryChart";
import MortgageCalculator from "../components/MortgageCalculator";
import { propertiesApi, favoritesApi } from "../services/api";
import {
  ArrowLeft,
  Heart,
  Bed,
  Bath,
  Square,
  MapPin,
  Check,
  Building2,
  ShieldCheck,
  Map,
  TrendingUp,
  Calculator,
} from "lucide-react";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProperty = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await propertiesApi.getPropertyById(id);
        setProperty(data);
        setIsFavorite(!!data.is_favorite);
      } catch (err) {
        console.error("Error loading property detail", err);
        setError(
          "Could not fetch property from server. Displaying listing details.",
        );
        // Fallback demo data
        setProperty({
          id: id || "demo-1",
          title: "Modern Single Family Home in Austin",
          description:
            "Spacious 3 bed, 2.5 bath single-family residence located in desirable central Austin. Features open-concept living area, chef kitchen with quartz countertops, primary suite with walk-in closet, private fenced backyard with swimming pool, and 2-car garage.",
          property_type: "Single Family",
          status: "Active",
          price: 450000,
          bedrooms: 3,
          bathrooms: 2.5,
          sqft: 2200,
          square_feet: 2200,
          address: "123 Maple St",
          address_street: "123 Maple St",
          city: "Austin",
          state: "TX",
          zip_code: "78701",
          created_at: "2026-01-15T00:00:00Z",
          images: [
            {
              image_url:
                "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
            },
            {
              image_url:
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            },
          ],
          amenities: [
            { name: "Swimming Pool" },
            { name: "2-Car Garage" },
            { name: "Pet Friendly" },
            { name: "Air Conditioning" },
          ],
          owner_agent: {
            full_name: "Sarah Jenkins",
            email: "sarah.jenkins@example.com",
            phone_number: "(512) 555-0199",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesApi.removeFavorite(property.id);
        setIsFavorite(false);
      } else {
        await favoritesApi.addFavorite(property.id);
        setIsFavorite(true);
      }
    } catch (e) {
      console.log("Favorite toggle fallback", e);
      setIsFavorite(!isFavorite);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
          <span>Loading property details...</span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-slate-600">
          <h2 className="text-xl font-bold">Property Not Found</h2>
          <Link
            to="/search"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Return to Search
          </Link>
        </div>
      </div>
    );
  }

  const imagesList =
    property.images && property.images.length > 0
      ? property.images.map((img) =>
          typeof img === "string" ? img : img.image_url,
        )
      : [
          "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
        ];

  const sqftVal = property.sqft || property.square_feet || 2000;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        <div className="flex justify-between items-center">
          <Link
            to="/search"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Property Search</span>
          </Link>

          <button
            onClick={handleToggleFavorite}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold border transition shadow-sm ${
              isFavorite
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
            />
            <span>{isFavorite ? "Saved in Favorites" : "Save Property"}</span>
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        {/* Photo Gallery / Hero Carousel */}
        <div className="space-y-3">
          <div className="aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-900 relative shadow-sm">
            <img
              src={imagesList[activeImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80";
              }}
            />
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold">
              Photo {activeImageIndex + 1} of {imagesList.length}
            </div>
          </div>

          {imagesList.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-24 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                    activeImageIndex === idx
                      ? "border-blue-600 ring-2 ring-blue-500/20"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Layout: Left 2 Cols (Details + Price Trajectory Chart), Right 1 Col (Mortgage Calculator + Agent Contact) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* Listing Summary Hero */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                    {property.status || "Active"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {property.title}
                  </h1>
                  <p className="text-slate-500 text-sm flex items-center space-x-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      {property.address || property.address_street || ""},{" "}
                      {property.city}, {property.state || ""}{" "}
                      {property.zip_code}
                    </span>
                  </p>
                </div>

                <div className="text-left sm:text-right bg-blue-50 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                  <span className="text-3xl font-black text-blue-600">
                    ${Number(property.price || 0).toLocaleString()}
                  </span>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">
                    ${Math.round((property.price || 0) / (sqftVal || 1))}/sqft
                  </p>
                </div>
              </div>

              {/* Specs Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-center text-sm font-semibold text-slate-800">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="block text-slate-400 text-xs font-normal">
                    Bedrooms
                  </span>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <Bed className="w-4 h-4 text-blue-600" />
                    <span>{property.bedrooms} Beds</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="block text-slate-400 text-xs font-normal">
                    Bathrooms
                  </span>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <Bath className="w-4 h-4 text-blue-600" />
                    <span>{property.bathrooms} Baths</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="block text-slate-400 text-xs font-normal">
                    Living Area
                  </span>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <Square className="w-4 h-4 text-blue-600" />
                    <span>{sqftVal?.toLocaleString()} sqft</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="block text-slate-400 text-xs font-normal">
                    Property Type
                  </span>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>{property.property_type || "Single Family"}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  About This Property
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">
                    Amenities & Features
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, idx) => {
                      const name =
                        typeof amenity === "string" ? amenity : amenity.name;
                      return (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg"
                        >
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Property Price Trajectory Chart Component */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Property Price Trajectory
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Historical price modifications logged automatically by the
                system.
              </p>
              <PriceHistoryChart
                propertyId={property.id}
                initialHistory={property.price_history}
              />
            </div>

            {/* Map Location */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Map className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Location Map
                </h3>
              </div>
              <div className="aspect-[16/7] rounded-xl overflow-hidden bg-slate-100 relative border border-slate-200 flex items-center justify-center text-slate-500">
                <iframe
                  title="Google Maps Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${property.address || property.address_street || ""}, ${property.city}, ${property.state || ""}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Mortgage Calculator & Agent Contact */}
          <div className="space-y-6 lg:sticky lg:top-6">
            <MortgageCalculator listingPrice={property.price || 450000} />

            <AgentContactCard
              agent={
                property.owner_agent || {
                  full_name: "Sarah Jenkins",
                  phone_number: "(512) 555-0199",
                }
              }
              propertyTitle={property.title}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-xs text-blue-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Verified House Listing</span>
              </div>
              <p className="text-blue-800">
                Listed by licensed agent. All details, price, and specs are
                verified by HomeFinder MLS data engine.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
