import React from "react";
import { Filter, SlidersHorizontal, Layers } from "lucide-react";

export default function FilterBar({
  genres = [],
  selectedGenre,
  onGenreChange,
  selectedYear,
  onYearChange,
  selectedRating,
  onRatingChange,
  contentType,
  onContentTypeChange,
  sortBy,
  onSortChange,
}) {
  const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2010];
  const ageRatings = ["G", "PG", "PG-13", "R", "TV-14", "TV-MA", "NC-17"];

  return (
    <div className="bg-[#1e2020] p-4 rounded-xl border border-gray-800 mb-8 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#a1c9ff] uppercase tracking-wider mr-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </div>

          <div className="flex rounded-lg bg-[#121414] p-1 border border-gray-800">
            {["all", "movie", "series"].map((type) => (
              <button
                key={type}
                onClick={() => onContentTypeChange && onContentTypeChange(type)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition ${
                  contentType === type
                    ? "bg-[#1a98ff] text-white"
                    : "text-[#bfc7d1] hover:text-white"
                }`}
              >
                {type === "all"
                  ? "All Content"
                  : type === "movie"
                    ? "Movies"
                    : "TV Series"}
              </button>
            ))}
          </div>

          <select
            value={selectedGenre || ""}
            onChange={(e) => onGenreChange && onGenreChange(e.target.value)}
            className="bg-[#121414] text-xs text-[#e3e2e2] px-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#1a98ff]"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.id || g.name} value={g.name || g}>
                {g.name || g}
              </option>
            ))}
          </select>

          <select
            value={selectedYear || ""}
            onChange={(e) => onYearChange && onYearChange(e.target.value)}
            className="bg-[#121414] text-xs text-[#e3e2e2] px-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#1a98ff]"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={selectedRating || ""}
            onChange={(e) => onRatingChange && onRatingChange(e.target.value)}
            className="bg-[#121414] text-xs text-[#e3e2e2] px-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#1a98ff]"
          >
            <option value="">All Ratings</option>
            {ageRatings.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#bfc7d1]">Sort By:</span>
          <select
            value={sortBy || "popularity"}
            onChange={(e) => onSortChange && onSortChange(e.target.value)}
            className="bg-[#121414] text-xs text-[#e3e2e2] px-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#1a98ff]"
          >
            <option value="popularity">Popularity</option>
            <option value="newest">Release Year (Newest)</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
