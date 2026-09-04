import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import HeroBanner from "../components/catalog/HeroBanner";
import FilterBar from "../components/common/FilterBar";
import ContentGrid from "../components/catalog/ContentGrid";
import { moviesApi, seriesApi, genresApi } from "../services/api";

const MOCK_CATALOG = [
  {
    id: "m-inception",
    title: "Inception",
    type: "movie",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into the mind of a C.E.O.",
    release_year: 2010,
    duration: 148,
    age_rating: "PG-13",
    status: "Available",
    poster_url:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60",
    genres: [
      { id: "1", name: "Sci-Fi" },
      { id: "2", name: "Action" },
    ],
  },
  {
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
        ],
      },
    ],
  },
  {
    id: "m-interstellar",
    title: "Interstellar",
    type: "movie",
    description:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
    release_year: 2014,
    duration: 169,
    age_rating: "PG-13",
    status: "Available",
    poster_url:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60",
    genres: [
      { id: "1", name: "Sci-Fi" },
      { id: "3", name: "Drama" },
    ],
  },
  {
    id: "m-the-dark-knight",
    title: "The Dark Knight",
    type: "movie",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    release_year: 2008,
    duration: 152,
    age_rating: "PG-13",
    status: "Available",
    poster_url:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60",
    genres: [
      { id: "2", name: "Action" },
      { id: "6", name: "Thriller" },
    ],
  },
];

export default function CatalogPage() {
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [moviesRes, seriesRes, genresRes] = await Promise.allSettled([
        moviesApi.getMovies(),
        seriesApi.getSeries(),
        genresApi.getGenres(),
      ]);

      let fetchedItems = [];
      if (moviesRes.status === "fulfilled" && Array.isArray(moviesRes.value)) {
        fetchedItems = [
          ...fetchedItems,
          ...moviesRes.value.map((m) => ({ ...m, type: "movie" })),
        ];
      }
      if (seriesRes.status === "fulfilled" && Array.isArray(seriesRes.value)) {
        fetchedItems = [
          ...fetchedItems,
          ...seriesRes.value.map((s) => ({ ...s, type: "series" })),
        ];
      }

      if (genresRes.status === "fulfilled" && Array.isArray(genresRes.value)) {
        setGenres(genresRes.value);
      } else {
        setGenres([
          { name: "Sci-Fi" },
          { name: "Action" },
          { name: "Drama" },
          { name: "Horror" },
          { name: "Thriller" },
        ]);
      }

      if (fetchedItems.length === 0) {
        setItems(MOCK_CATALOG);
      } else {
        setItems(fetchedItems);
      }
    } catch (err) {
      console.warn("Catalog fetch fallback to mock data", err);
      setItems(MOCK_CATALOG);
      setGenres([
        { name: "Sci-Fi" },
        { name: "Action" },
        { name: "Drama" },
        { name: "Horror" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (item.status === "SoftDeleted") return false;

    if (contentType === "movie" && item.type === "series") return false;
    if (contentType === "series" && item.type === "movie" && !item.seasons)
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      const castMatch = item.cast_members?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !castMatch) return false;
    }

    if (selectedGenre) {
      const hasGenre = item.genres?.some(
        (g) => (g.name || g).toLowerCase() === selectedGenre.toLowerCase(),
      );
      if (!hasGenre) return false;
    }

    if (selectedYear && String(item.release_year) !== String(selectedYear)) {
      return false;
    }

    if (selectedRating && item.age_rating !== selectedRating) {
      return false;
    }

    return true;
  });

  const featuredItem =
    items.find((i) => i.title === "Inception") || items[0] || MOCK_CATALOG[0];

  return (
    <div className="min-h-screen bg-[#121414] text-[#e3e2e2] flex flex-col">
      <Navbar onSearchChange={setSearchQuery} searchQuery={searchQuery} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <HeroBanner featuredItem={featuredItem} />

        <FilterBar
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedRating={selectedRating}
          onRatingChange={setSelectedRating}
          contentType={contentType}
          onContentTypeChange={setContentType}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white tracking-wide">
            {contentType === "movie"
              ? "Movies Catalog"
              : contentType === "series"
                ? "TV Series Catalog"
                : "Trending Movies & TV Series"}
          </h2>
          <span className="text-xs text-[#bfc7d1]">
            Showing {filteredItems.length} title
            {filteredItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        <ContentGrid items={filteredItems} loading={loading} error={error} />
      </main>

      <footer className="bg-[#1e2020] border-t border-gray-800 py-6 text-center text-xs text-[#bfc7d1] mt-12">
        <p>
          © 2026 Prime Video Clone - Movies & Series Management System. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
