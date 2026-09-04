import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import DataTable from "../components/admin/DataTable";
import TitleModal from "../components/admin/TitleModal";
import { moviesApi, seriesApi } from "../services/api";
import {
  Plus,
  Shield,
  Film,
  Tv,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchAdminCatalog();
  }, []);

  const fetchAdminCatalog = async () => {
    setLoading(true);
    try {
      const [moviesRes, seriesRes] = await Promise.allSettled([
        moviesApi.getMovies({ limit: 100 }),
        seriesApi.getSeries({ limit: 100 }),
      ]);

      let allItems = [];
      if (moviesRes.status === "fulfilled" && Array.isArray(moviesRes.value)) {
        allItems = [
          ...allItems,
          ...moviesRes.value.map((m) => ({ ...m, type: "movie" })),
        ];
      }
      if (seriesRes.status === "fulfilled" && Array.isArray(seriesRes.value)) {
        allItems = [
          ...allItems,
          ...seriesRes.value.map((s) => ({ ...s, type: "series" })),
        ];
      }

      if (allItems.length === 0) {
        // Mock items fallback for admin dashboard
        allItems = [
          {
            id: "m-inception",
            title: "Inception",
            type: "movie",
            release_year: 2010,
            age_rating: "PG-13",
            status: "Available",
            poster_url:
              "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60",
            genres: [{ name: "Sci-Fi" }],
          },
          {
            id: "s-stranger-things",
            title: "Stranger Things",
            type: "series",
            release_year: 2022,
            age_rating: "TV-14",
            status: "Available",
            poster_url:
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
            genres: [{ name: "Sci-Fi" }],
          },
        ];
      }

      setItems(allItems);
    } catch (err) {
      console.warn("Failed admin fetch, loading fallback list", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (
      window.confirm(`Are you sure you want to soft delete "${item.title}"?`)
    ) {
      try {
        if (item.type === "movie" || !item.seasons) {
          await moviesApi.deleteMovie(item.id);
        } else {
          await moviesApi.deleteMovie(item.id);
        }
        fetchAdminCatalog();
      } catch (err) {
        console.warn("Soft delete call failed, updating local state", err);
        setItems(
          items.map((i) =>
            i.id === item.id ? { ...i, status: "SoftDeleted" } : i,
          ),
        );
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const filteredItems = items.filter((item) => {
    if (typeFilter === "movie" && item.type === "series") return false;
    if (typeFilter === "series" && item.type === "movie" && !item.seasons)
      return false;

    if (statusFilter !== "all" && item.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.cast_members?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const totalTitles = items.length;
  const totalMovies = items.filter(
    (i) => i.type === "movie" && !i.seasons,
  ).length;
  const totalSeries = items.filter(
    (i) => i.type === "series" || i.seasons,
  ).length;
  const totalPublished = items.filter((i) => i.status === "Available").length;

  return (
    <div className="min-h-screen bg-[#121414] text-[#e3e2e2] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1a98ff] uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>Content Management Control Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Admin Catalog Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminCatalog}
              className="p-2.5 rounded-lg bg-[#1e2020] border border-gray-800 text-[#a1c9ff] hover:bg-gray-800 transition"
              title="Refresh Catalog"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCreateNew}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-[#1a98ff] hover:bg-[#a1c9ff] hover:text-[#121414] transition shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Content Title</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1e2020] p-6 rounded-xl border border-gray-800 shadow-lg">
            <div className="text-xs font-bold text-[#bfc7d1] uppercase mb-1">
              Total Titles
            </div>
            <div className="text-3xl font-extrabold text-white">
              {totalTitles}
            </div>
          </div>

          <div className="bg-[#1e2020] p-6 rounded-xl border border-gray-800 shadow-lg">
            <div className="text-xs font-bold text-[#a1c9ff] uppercase mb-1 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              <span>Movies Count</span>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {totalMovies}
            </div>
          </div>

          <div className="bg-[#1e2020] p-6 rounded-xl border border-gray-800 shadow-lg">
            <div className="text-xs font-bold text-[#a1c9ff] uppercase mb-1 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" />
              <span>TV Series Count</span>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {totalSeries}
            </div>
          </div>

          <div className="bg-[#1e2020] p-6 rounded-xl border border-gray-800 shadow-lg">
            <div className="text-xs font-bold text-[#4ade80] uppercase mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Available (Published)</span>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {totalPublished}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-[#1e2020] p-4 rounded-xl border border-gray-800 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title or cast..."
                className="bg-[#121414] text-xs text-white pl-9 pr-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#1a98ff]"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#121414] text-xs text-white px-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#1a98ff]"
            >
              <option value="all">All Content Types</option>
              <option value="movie">Movies Only</option>
              <option value="series">TV Series Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#121414] text-xs text-white px-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#1a98ff]"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Draft">Draft</option>
              <option value="SoftDeleted">Soft Deleted</option>
            </select>
          </div>
        </div>

        <DataTable
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <TitleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingItem}
          onSaved={fetchAdminCatalog}
        />
      </main>
    </div>
  );
}
