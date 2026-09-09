import React from "react";
import { Search, Filter, RotateCcw, BookOpen } from "lucide-react";

export const SearchFilterBar = ({
  searchQuery,
  setSearchQuery,
  genreFilter,
  setGenreFilter,
  statusFilter,
  setStatusFilter,
  isbnFilter,
  setIsbnFilter,
  genres = [],
  onReset,
  totalResults,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
      <div className="flex flex-col gap-4">
        {/* Main Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search book catalog by title, author, keyword, or ISBN..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#122338] focus:border-transparent transition"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {/* Genre Filter */}
          <div>
            <label
              htmlFor="genre-select"
              className="block text-xs font-semibold text-[#566070] mb-1 uppercase tracking-wider"
            >
              Genre
            </label>
            <select
              id="genre-select"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#122338] transition"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Status Filter */}
          <div>
            <label
              htmlFor="status-select"
              className="block text-xs font-semibold text-[#566070] mb-1 uppercase tracking-wider"
            >
              Availability
            </label>
            <select
              id="status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#122338] transition"
            >
              <option value="">All Copies</option>
              <option value="available">Available Now</option>
              <option value="checked_out">Checked Out / Reserved</option>
            </select>
          </div>

          {/* ISBN Filter */}
          <div>
            <label
              htmlFor="isbn-input"
              className="block text-xs font-semibold text-[#566070] mb-1 uppercase tracking-wider"
            >
              ISBN
            </label>
            <input
              id="isbn-input"
              type="text"
              value={isbnFilter}
              onChange={(e) => setIsbnFilter(e.target.value)}
              placeholder="e.g. 9780132350884"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-[#111c2d] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#122338] transition"
            />
          </div>

          {/* Reset Action & Counts */}
          <div className="flex items-end justify-between sm:justify-end gap-2">
            <button
              onClick={onReset}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-[#566070] bg-white hover:bg-gray-50 hover:text-[#111c2d] transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 text-gray-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Total Results indicator */}
        <div className="flex items-center justify-between text-xs text-[#566070] pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
            <span>
              Showing <strong className="text-[#111c2d]">{totalResults}</strong>{" "}
              books in library catalog
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
