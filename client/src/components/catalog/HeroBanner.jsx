import React from "react";
import { Play, Info, Star, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroBanner({ featuredItem }) {
  const navigate = useNavigate();

  const title = featuredItem?.title || "Inception";
  const description =
    featuredItem?.description ||
    "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.";
  const releaseYear = featuredItem?.release_year || 2010;
  const ageRating = featuredItem?.age_rating || "PG-13";
  const duration = featuredItem?.duration
    ? `${featuredItem.duration}m`
    : "148m";
  const genresStr = featuredItem?.genres
    ? featuredItem.genres.map((g) => g.name || g).join(" • ")
    : "Sci-Fi • Action • Thriller";
  const itemId = featuredItem?.id || "sample-inception";

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1e2020] via-[#121414] to-black border border-gray-800 p-8 md:p-12 mb-10 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-[#121414] via-transparent to-transparent z-10 pointer-events-none" />

      <div className="relative z-20 max-w-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1a98ff] bg-[#1a98ff]/10 border border-[#1a98ff]/30 px-3 py-1 rounded-full w-fit mb-4">
          <Star className="w-3.5 h-3.5 fill-[#1a98ff]" />
          <span>FEATURED TITLE</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#bfc7d1] mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {releaseYear}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {duration}
          </span>
          <span>•</span>
          <span className="border border-gray-700 px-2 py-0.5 rounded text-[11px] font-semibold text-gray-300">
            {ageRating}
          </span>
          <span>•</span>
          <span className="text-[#a1c9ff]">{genresStr}</span>
        </div>

        <p className="text-sm text-[#bfc7d1] leading-relaxed mb-6 line-clamp-3">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate(`/titles/${itemId}`)}
            className="flex items-center gap-2 bg-[#1a98ff] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#a1c9ff] hover:text-[#121414] transition shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Watch Now / Details</span>
          </button>

          <button
            onClick={() => navigate(`/titles/${itemId}`)}
            className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 border border-gray-700 transition"
          >
            <Info className="w-4 h-4" />
            <span>More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}
