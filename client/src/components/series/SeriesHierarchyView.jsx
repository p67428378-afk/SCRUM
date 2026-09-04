import React, { useState } from "react";
import { Play, Plus, Clock, Tv, AlertCircle } from "lucide-react";
import { seriesApi } from "../../services/api";

export default function SeriesHierarchyView({
  series,
  isAdmin = false,
  onRefresh,
}) {
  const seasons = series?.seasons || [];
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);

  const [showAddSeason, setShowAddSeason] = useState(false);
  const [newSeasonNumber, setNewSeasonNumber] = useState(
    (seasons.length || 0) + 1,
  );
  const [newSeasonTitle, setNewSeasonTitle] = useState("");

  const [showAddEpisode, setShowAddEpisode] = useState(false);
  const [epNumber, setEpNumber] = useState(1);
  const [epTitle, setEpTitle] = useState("");
  const [epRuntime, setEpRuntime] = useState(45);
  const [epStreamUrl, setEpStreamUrl] = useState("");
  const [epThumbnailUrl, setEpThumbnailUrl] = useState("");
  const [formError, setLoginError] = useState("");

  const activeSeason = seasons[selectedSeasonIndex] || seasons[0] || null;
  const episodes = activeSeason?.episodes || [];

  const handleAddSeason = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await seriesApi.addSeason(series.id, {
        season_number: parseInt(newSeasonNumber, 10),
        title: newSeasonTitle || `Season ${newSeasonNumber}`,
      });
      setShowAddSeason(false);
      setNewSeasonTitle("");
      if (onRefresh) onRefresh();
    } catch (err) {
      setLoginError(err.response?.data?.detail || "Failed to add season.");
    }
  };

  const handleAddEpisode = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!activeSeason?.id) {
      setLoginError("No active season selected.");
      return;
    }
    try {
      await seriesApi.addEpisode(activeSeason.id, {
        episode_number: parseInt(epNumber, 10),
        title: epTitle,
        runtime: parseInt(epRuntime, 10),
        stream_url: epStreamUrl,
        thumbnail_url: epThumbnailUrl,
      });
      setShowAddEpisode(false);
      setEpTitle("");
      setEpStreamUrl("");
      if (onRefresh) onRefresh();
    } catch (err) {
      setLoginError(
        err.response?.data?.detail ||
          "Failed to add episode (e.g. duplicate episode number).",
      );
    }
  };

  return (
    <div className="bg-[#1e2020] rounded-2xl p-6 border border-gray-800 shadow-xl mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-[#1a98ff]" />
          <h2 className="text-xl font-bold text-white">Seasons & Episodes</h2>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setNewSeasonNumber((seasons.length || 0) + 1);
                setShowAddSeason(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a98ff]/10 text-[#1a98ff] border border-[#1a98ff]/30 hover:bg-[#1a98ff] hover:text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Season</span>
            </button>
            {activeSeason && (
              <button
                onClick={() => {
                  setEpNumber((episodes.length || 0) + 1);
                  setShowAddEpisode(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-[#a1c9ff] border border-gray-700 hover:bg-gray-700 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Episode</span>
              </button>
            )}
          </div>
        )}
      </div>

      {seasons.length === 0 ? (
        <div className="p-8 text-center bg-[#121414] rounded-xl border border-gray-800">
          <p className="text-sm text-[#bfc7d1]">
            No seasons available for this series yet.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {seasons.map((season, idx) => (
              <button
                key={season.id || idx}
                onClick={() => setSelectedSeasonIndex(idx)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedSeasonIndex === idx
                    ? "bg-[#1a98ff] text-white shadow-md"
                    : "bg-[#121414] text-[#bfc7d1] hover:text-white border border-gray-800"
                }`}
              >
                Season {season.season_number}{" "}
                {season.title
                  ? `(${season.title})`
                  : `(${season.episodes?.length || 0} Episodes)`}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {episodes.length === 0 ? (
              <p className="text-xs text-[#bfc7d1] py-6 text-center bg-[#121414] rounded-lg">
                No episodes listed for Season {activeSeason?.season_number}.
              </p>
            ) : (
              episodes.map((ep) => (
                <div
                  key={ep.id || ep.episode_number}
                  className="bg-[#121414] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-[#1e2020] border border-gray-800 flex items-center justify-center font-extrabold text-[#1a98ff] text-base shrink-0">
                      E{ep.episode_number}
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">
                        {ep.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-[#bfc7d1]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ep.runtime || 45} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={ep.stream_url || "#"}
                    onClick={(e) => {
                      if (!ep.stream_url) {
                        e.preventDefault();
                        alert(
                          `Playing Episode ${ep.episode_number}: ${ep.title}`,
                        );
                      }
                    }}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full md:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-[#1a98ff] text-white hover:bg-[#a1c9ff] hover:text-[#121414] transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Episode</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {showAddSeason && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e2020] border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-base font-bold text-white mb-4">
              Add Season to {series?.title}
            </h3>
            {formError && (
              <p className="text-xs text-[#f87171] mb-3">{formError}</p>
            )}
            <form onSubmit={handleAddSeason} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Season Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={newSeasonNumber}
                  onChange={(e) => setNewSeasonNumber(e.target.value)}
                  required
                  className="w-full bg-[#121414] border border-gray-700 rounded p-2 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Season Title (Optional)
                </label>
                <input
                  type="text"
                  value={newSeasonTitle}
                  onChange={(e) => setNewSeasonTitle(e.target.value)}
                  placeholder="e.g. Season 1"
                  className="w-full bg-[#121414] border border-gray-700 rounded p-2 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddSeason(false)}
                  className="px-4 py-2 rounded text-xs text-gray-400 bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-bold text-white bg-[#1a98ff]"
                >
                  Save Season
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddEpisode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e2020] border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-base font-bold text-white mb-4">
              Add Episode to Season {activeSeason?.season_number}
            </h3>
            {formError && (
              <p className="text-xs text-[#f87171] mb-3">{formError}</p>
            )}
            <form onSubmit={handleAddEpisode} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Episode Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={epNumber}
                  onChange={(e) => setEpNumber(e.target.value)}
                  required
                  className="w-full bg-[#121414] border border-gray-700 rounded p-2 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Episode Title
                </label>
                <input
                  type="text"
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                  required
                  placeholder="e.g. Chapter One: The Vanishing"
                  className="w-full bg-[#121414] border border-gray-700 rounded p-2 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Runtime (minutes)
                </label>
                <input
                  type="number"
                  value={epRuntime}
                  onChange={(e) => setEpRuntime(e.target.value)}
                  className="w-full bg-[#121414] border border-gray-700 rounded p-2 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Stream URL
                </label>
                <input
                  type="url"
                  value={epStreamUrl}
                  onChange={(e) => setEpStreamUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#121414] border border-gray-700 rounded p-2 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddEpisode(false)}
                  className="px-4 py-2 rounded text-xs text-gray-400 bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-bold text-white bg-[#1a98ff]"
                >
                  Save Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
