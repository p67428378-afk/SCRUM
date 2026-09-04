import React from "react";
import { Play, Tv, Film, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContentGrid({
  items = [],
  loading = false,
  error = null,
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-[#1e2020] animate-pulse h-80 rounded-xl border border-gray-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1e2020] border border-red-900/50 p-6 rounded-xl text-center my-8">
        <p className="text-[#f87171] text-sm font-semibold mb-2">{error}</p>
        <p className="text-xs text-[#bfc7d1]">
          Please check backend connection or search query filters.
        </p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-[#1e2020] border border-gray-800 p-12 rounded-xl text-center my-8">
        <Film className="w-12 h-12 text-[#1a98ff] mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold text-white mb-2">No Content Found</h3>
        <p className="text-sm text-[#bfc7d1] max-w-md mx-auto mb-6">
          No movies or series match your search criteria. Try adjusting your
          filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => {
        const isSeries = Boolean(item.seasons || item.type === "series");
        const poster =
          item.poster_url ||
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60";
        const title = item.title || "Untitled";
        const year = item.release_year || "2023";
        const ageRating = item.age_rating || "PG-13";
        const genresStr =
          item.genres && Array.isArray(item.genres)
            ? item.genres.map((g) => g.name || g).join(", ")
            : "";

        return (
          <div
            key={item.id}
            onClick={() => navigate(`/titles/${item.id}`)}
            className="group bg-[#1e2020] rounded-xl overflow-hidden border border-gray-800 hover:border-[#1a98ff] transition duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-2xl"
          >
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
              <img
                src={poster}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                <button className="bg-[#1a98ff] text-white p-3.5 rounded-full shadow-lg transform group-hover:scale-110 transition duration-300">
                  <Play className="w-5 h-5 fill-current" />
                </button>
              </div>

              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-white flex items-center gap-1 border border-white/10">
                {isSeries ? (
                  <Tv className="w-3 h-3 text-[#1a98ff]" />
                ) : (
                  <Film className="w-3 h-3 text-[#1a98ff]" />
                )}
                <span>{isSeries ? "SERIES" : "MOVIE"}</span>
              </div>

              {item.age_rating && (
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-[#a1c9ff] border border-white/10">
                  {ageRating}
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-[#1a98ff] transition line-clamp-1 mb-1">
                  {title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#bfc7d1] mb-2">
                  <span>{year}</span>
                  {item.duration && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.duration}m
                      </span>
                    </>
                  )}
                  {isSeries && item.seasons && (
                    <>
                      <span>•</span>
                      <span>
                        {item.seasons.length} Season
                        {item.seasons.length > 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {genresStr && (
                <p className="text-[11px] text-[#a1c9ff] line-clamp-1 border-t border-gray-800/80 pt-2 mt-2">
                  {genresStr}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
