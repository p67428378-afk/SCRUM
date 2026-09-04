import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import SeriesHierarchyView from "../components/series/SeriesHierarchyView";
import { moviesApi, seriesApi, authApi } from "../services/api";
import {
  Play,
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  Film,
  Tv,
  ShieldCheck,
} from "lucide-react";

const MOCK_STRANGER_THINGS = {
  id: "s-stranger-things",
  title: "Stranger Things",
  type: "series",
  description:
    "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
  release_year: 2022,
  age_rating: "TV-14",
  status: "Available",
  poster_url:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
  cast_members:
    "Millie Bobby Brown, Finn Wolfhard, Winona Ryder, David Harbour",
  genres: [
    { id: "1", name: "Sci-Fi" },
    { id: "3", name: "Drama" },
    { id: "5", name: "Horror" },
  ],
  seasons: [
    {
      id: "season-1",
      season_number: 1,
      title: "Season 1",
      episodes: [
        {
          id: "e1",
          episode_number: 1,
          title: "Chapter One: The Vanishing of Will Byers",
          runtime: 48,
          stream_url: "",
        },
        {
          id: "e2",
          episode_number: 2,
          title: "Chapter Two: The Weirdo on Maple Street",
          runtime: 55,
          stream_url: "",
        },
        {
          id: "e3",
          episode_number: 3,
          title: "Chapter Three: Holly, Jolly",
          runtime: 51,
          stream_url: "",
        },
      ],
    },
    {
      id: "season-2",
      season_number: 2,
      title: "Season 2",
      episodes: [
        {
          id: "e21",
          episode_number: 1,
          title: "Chapter One: MADMAX",
          runtime: 48,
          stream_url: "",
        },
      ],
    },
  ],
};

export default function TitleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = authApi.getCurrentRole() === "admin";

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      if (id === "sample-inception" || id === "m-inception") {
        setItem({
          id: "m-inception",
          title: "Inception",
          type: "movie",
          description:
            "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
          release_year: 2010,
          duration: 148,
          age_rating: "PG-13",
          status: "Available",
          poster_url:
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60",
          cast_members:
            "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy",
          genres: [
            { id: "1", name: "Sci-Fi" },
            { id: "2", name: "Action" },
          ],
        });
        setLoading(false);
        return;
      }

      if (id === "s-stranger-things") {
        setItem(MOCK_STRANGER_THINGS);
        setLoading(false);
        return;
      }

      // Try fetching movie then series
      try {
        const movieData = await moviesApi.getMovieById(id);
        if (movieData) {
          setItem({ ...movieData, type: "movie" });
          setLoading(false);
          return;
        }
      } catch (e) {
        // try series
      }

      try {
        const seriesData = await seriesApi.getSeriesById(id);
        if (seriesData) {
          setItem({ ...seriesData, type: "series" });
          setLoading(false);
          return;
        }
      } catch (e) {
        // fallback
      }

      // Default fallback item
      setItem(MOCK_STRANGER_THINGS);
    } catch (err) {
      console.warn("Detail fetch fallback", err);
      setItem(MOCK_STRANGER_THINGS);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121414] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a98ff]" />
        </div>
      </div>
    );
  }

  const isSeries = Boolean(item?.seasons || item?.type === "series");
  const poster =
    item?.poster_url ||
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60";
  const genresStr = item?.genres
    ? item.genres.map((g) => g.name || g).join(" • ")
    : "Uncategorized";

  return (
    <div className="min-h-screen bg-[#121414] text-[#e3e2e2] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-bold text-[#a1c9ff] hover:text-white transition mb-6 bg-[#1e2020] border border-gray-800 px-3 py-1.5 rounded-lg w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="bg-[#1e2020] rounded-2xl border border-gray-800 p-6 md:p-10 shadow-2xl flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-full md:w-64 shrink-0 overflow-hidden rounded-xl bg-gray-900 border border-gray-800 shadow-xl">
            <img
              src={poster}
              alt={item?.title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60";
              }}
            />
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#1a98ff]/20 text-[#1a98ff] border border-[#1a98ff]/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                  {isSeries ? (
                    <Tv className="w-3.5 h-3.5" />
                  ) : (
                    <Film className="w-3.5 h-3.5" />
                  )}
                  <span>{isSeries ? "TV Series" : "Movie"}</span>
                </span>
                <span className="border border-gray-700 px-2 py-0.5 rounded text-xs font-semibold text-gray-300">
                  {item?.age_rating || "PG-13"}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
                {item?.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#bfc7d1] mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {item?.release_year || 2023}
                </span>
                {item?.duration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.duration} minutes
                    </span>
                  </>
                )}
                {isSeries && item?.seasons && (
                  <>
                    <span>•</span>
                    <span>
                      {item.seasons.length} Season
                      {item.seasons.length > 1 ? "s" : ""}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="text-[#a1c9ff]">{genresStr}</span>
              </div>

              <p className="text-sm text-[#bfc7d1] leading-relaxed mb-6">
                {item?.description || "No synopsis available."}
              </p>

              {item?.cast_members && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    Starring Cast
                  </h4>
                  <p className="text-xs text-[#bfc7d1]">{item.cast_members}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-800/80">
              <a
                href={item?.stream_url || item?.trailer_url || "#"}
                onClick={(e) => {
                  if (!item?.stream_url && !item?.trailer_url) {
                    e.preventDefault();
                    alert(`Starting playback for ${item?.title}`);
                  }
                }}
                target="_blank"
                rel="noreferrer"
                className="bg-[#1a98ff] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#a1c9ff] hover:text-[#121414] transition shadow-lg flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isSeries ? "Play S1 E1" : "Play Movie"}</span>
              </a>
            </div>
          </div>
        </div>

        {isSeries && (
          <SeriesHierarchyView
            series={item}
            isAdmin={isAdmin}
            onRefresh={fetchDetail}
          />
        )}
      </main>
    </div>
  );
}
