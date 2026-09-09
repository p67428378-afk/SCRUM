import React, { useState, useEffect } from "react";
import { fetchCredits } from "../../services/api";
import {
  Film,
  Tv,
  Theater as TheaterIcon,
  Sparkles,
  Award,
  Search,
} from "lucide-react";

export default function FilmographyTable() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [credits, setCredits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Television", "Film", "Theater", "Commercials"];

  useEffect(() => {
    async function loadCreditsData() {
      setLoading(true);
      const data = await fetchCredits(
        selectedCategory === "All" ? "" : selectedCategory,
      );
      setCredits(data);
      setLoading(false);
    }
    loadCreditsData();
  }, [selectedCategory]);

  const filteredCredits = credits.filter((credit) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      credit.production_title.toLowerCase().includes(q) ||
      credit.role_name.toLowerCase().includes(q) ||
      (credit.director && credit.director.toLowerCase().includes(q)) ||
      (credit.notes && credit.notes.toLowerCase().includes(q))
    );
  });

  const getCategoryBadgeColor = (category) => {
    switch (category?.toLowerCase()) {
      case "television":
        return "bg-amber-500/10 text-[#F59E0B] border-amber-500/30";
      case "film":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "theater":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "commercials":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-gray-500/10 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Category Tabs & Search Input Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F131C] p-4 rounded-xl border border-white/10">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat
                  ? "bg-[#F59E0B] text-[#0A0E17] px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-[#F59E0B]/20"
                  : "bg-[#181B25] text-[#9CA3AF] hover:text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border border-white/5 hover:border-white/20"
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, role, director..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181B25] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#F59E0B]"
          />
        </div>
      </div>

      {/* Filmography Table */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCredits.length === 0 ? (
        <div className="text-center py-16 bg-[#0F131C] rounded-xl border border-white/10">
          <p className="text-[#9CA3AF] text-sm">
            No filmography credits found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#0F131C] rounded-xl border border-white/10 shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181B25] text-[#9CA3AF] uppercase text-[11px] font-bold tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Production Title</th>
                <th className="p-4">Role</th>
                <th className="p-4">Director / Network</th>
                <th className="p-4">Year</th>
                <th className="p-4">Accolades & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredCredits.map((credit) => (
                <tr
                  key={credit.id}
                  className="hover:bg-[#181B25]/60 transition-colors"
                >
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getCategoryBadgeColor(credit.category)}`}
                    >
                      {credit.category}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white whitespace-nowrap">
                    {credit.production_title}
                  </td>
                  <td className="p-4 text-gray-200">
                    {credit.role_name}
                    {credit.role_type && (
                      <span className="text-xs text-[#9CA3AF] block sm:inline sm:ml-1">
                        ({credit.role_type})
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-[#9CA3AF] text-xs whitespace-nowrap">
                    {credit.director || "—"}
                  </td>
                  <td className="p-4 text-[#F59E0B] font-mono font-semibold text-xs whitespace-nowrap">
                    {credit.release_year}
                  </td>
                  <td className="p-4 text-xs text-[#9CA3AF]">
                    {credit.notes ? (
                      <span className="flex items-center gap-1.5 text-[#F59E0B] font-medium">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>{credit.notes}</span>
                      </span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
