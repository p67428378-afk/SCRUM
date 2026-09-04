import React, { useState, useEffect } from "react";
import { X, Film, Tv, Save, AlertCircle } from "lucide-react";
import { moviesApi, seriesApi, genresApi } from "../../services/api";

export default function TitleModal({
  isOpen,
  onClose,
  initialData = null,
  onSaved,
}) {
  const isEditing = Boolean(initialData?.id);
  const [contentType, setContentType] = useState(
    initialData?.type || (initialData?.seasons ? "series" : "movie"),
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState(2023);
  const [ageRating, setAgeRating] = useState("PG-13");
  const [duration, setDuration] = useState(120);
  const [posterUrl, setPosterUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [castMembers, setCastMembers] = useState("");
  const [status, setStatus] = useState("Available");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setReleaseYear(initialData.release_year || 2023);
      setAgeRating(initialData.age_rating || "PG-13");
      setDuration(initialData.duration || 120);
      setPosterUrl(initialData.poster_url || "");
      setTrailerUrl(initialData.trailer_url || "");
      setStreamUrl(initialData.stream_url || "");
      setCastMembers(initialData.cast_members || "");
      setStatus(initialData.status || "Available");
      setContentType(
        initialData.seasons || initialData.type === "series"
          ? "series"
          : "movie",
      );
      if (initialData.genres) {
        setSelectedGenres(
          initialData.genres.map((g) => (typeof g === "string" ? g : g.name)),
        );
      }
    } else {
      resetForm();
    }
  }, [initialData]);

  const fetchGenres = async () => {
    try {
      const res = await genresApi.getGenres();
      setAvailableGenres(res || []);
    } catch (err) {
      console.warn("Using default genre list", err);
      setAvailableGenres([
        { id: "1", name: "Action" },
        { id: "2", name: "Sci-Fi" },
        { id: "3", name: "Drama" },
        { id: "4", name: "Comedy" },
        { id: "5", name: "Horror" },
        { id: "6", name: "Thriller" },
      ]);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setReleaseYear(2023);
    setAgeRating("PG-13");
    setDuration(120);
    setPosterUrl("");
    setTrailerUrl("");
    setStreamUrl("");
    setCastMembers("");
    setStatus("Available");
    setSelectedGenres([]);
    setError("");
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      title,
      description,
      release_year: parseInt(releaseYear, 10),
      age_rating: ageRating,
      poster_url: posterUrl,
      trailer_url: trailerUrl,
      cast_members: castMembers,
      status,
    };

    if (contentType === "movie") {
      payload.duration = parseInt(duration, 10);
      payload.stream_url = streamUrl;
    }

    try {
      if (isEditing) {
        if (contentType === "movie") {
          await moviesApi.updateMovie(initialData.id, payload);
        } else {
          // Series update if supported or movie fallback
          await moviesApi.updateMovie(initialData.id, payload);
        }
      } else {
        if (contentType === "movie") {
          await moviesApi.createMovie(payload);
        } else {
          await seriesApi.createSeries(payload);
        }
      }

      setSubmitting(false);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error("Save title error", err);
      setSubmitting(false);
      setError(
        err.response?.data?.detail ||
          "Failed to save title entry. Check network or server status.",
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#1e2020] border border-gray-800 rounded-2xl w-full max-w-2xl p-6 md:p-8 shadow-2xl my-8">
        <div className="flex justify-between items-center pb-4 border-b border-gray-800 mb-6">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            {contentType === "series" ? (
              <Tv className="w-5 h-5 text-[#1a98ff]" />
            ) : (
              <Film className="w-5 h-5 text-[#1a98ff]" />
            )}
            <span>
              {isEditing
                ? `Edit Title Entry: ${initialData?.title}`
                : "Add New Content Entry"}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-800 p-3 rounded-lg text-xs text-[#f87171] mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="flex rounded-lg bg-[#121414] p-1 border border-gray-800 w-fit mb-4">
              <button
                type="button"
                onClick={() => setContentType("movie")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                  contentType === "movie"
                    ? "bg-[#1a98ff] text-white"
                    : "text-[#bfc7d1]"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Movie</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType("series")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
                  contentType === "series"
                    ? "bg-[#1a98ff] text-white"
                    : "text-[#bfc7d1]"
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>TV Series</span>
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Inception / Stranger Things"
              className="w-full bg-[#121414] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
              Description / Synopsis
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter plot summary..."
              className="w-full bg-[#121414] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                Release Year
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                className="w-full bg-[#121414] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                Age Rating
              </label>
              <select
                value={ageRating}
                onChange={(e) => setAgeRating(e.target.value)}
                className="w-full bg-[#121414] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
              >
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="TV-14">TV-14</option>
                <option value="TV-MA">TV-MA</option>
              </select>
            </div>

            {contentType === "movie" && (
              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#121414] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                Poster Image URL
              </label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#121414] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                Trailer / Video Stream URL
              </label>
              <input
                type="url"
                value={streamUrl || trailerUrl}
                onChange={(e) => {
                  setStreamUrl(e.target.value);
                  setTrailerUrl(e.target.value);
                }}
                placeholder="https://..."
                className="w-full bg-[#121414] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
              Cast Members (Comma Separated)
            </label>
            <input
              type="text"
              value={castMembers}
              onChange={(e) => setCastMembers(e.target.value)}
              placeholder="Leonardo DiCaprio, Joseph Gordon-Levitt..."
              className="w-full bg-[#121414] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
              Availability Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#121414] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
            >
              <option value="Available">Available (Published)</option>
              <option value="Draft">Draft (Hidden)</option>
              <option value="SoftDeleted">Soft Deleted</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 bg-gray-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#1a98ff] hover:bg-[#a1c9ff] hover:text-[#121414] transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Saving..." : "Save & Publish"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
