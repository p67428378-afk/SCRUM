import React, { useState } from "react";
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  ArrowUpDown,
  Filter,
  X,
  Check,
} from "lucide-react";

export default function CreditsTable({
  credits = [],
  onAddCredit,
  onDeleteCredit,
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' or 'asc' by year
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    category: "Film",
    production_name: "",
    role_name: "",
    director: "",
    year: new Date().getFullYear(),
    additional_notes: "",
  });

  const categories = [
    "all",
    "Theater",
    "Film",
    "Television",
    "Commercials",
    "Voiceover",
  ];

  const filteredCredits = credits.filter((credit) => {
    if (activeCategory === "all") return true;
    return credit.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  const sortedCredits = [...filteredCredits].sort((a, b) => {
    const yearA = parseInt(a.year) || 0;
    const yearB = parseInt(b.year) || 0;
    return sortOrder === "desc" ? yearB - yearA : yearA - yearB;
  });

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.production_name || !formData.role_name) return;

    if (onAddCredit) {
      await onAddCredit(formData);
    }
    setFormData({
      category: "Film",
      production_name: "",
      role_name: "",
      director: "",
      year: new Date().getFullYear(),
      additional_notes: "",
    });
    setModalOpen(false);
  };

  return (
    <div className="bg-[#111319] border border-[#1a1d26] rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1a1d26] mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#e1e2e9] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#f2ca50]" />
            Filmography & Performance Credits
          </h2>
          <p className="text-xs text-[#d0c5af] mt-1">
            Categorized credits across Theater, Film, TV, Commercials, and
            Voiceover.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f2ca50] to-[#d4af37] text-[#0b0e13] font-bold text-xs hover:brightness-110 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Credit
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#0b0e13] p-2 rounded-lg border border-[#1a1d26]">
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                activeCategory === cat
                  ? "bg-[#f2ca50] text-[#0b0e13]"
                  : "text-[#d0c5af] hover:text-[#e1e2e9] hover:bg-[#1a1d26]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-[#f2ca50] border border-[#f2ca50]/20 bg-[#1a1d26] hover:bg-[#252a36]"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort Year: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Credits Data Table */}
      {sortedCredits.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#1a1d26] rounded-xl bg-[#0b0e13]/50">
          <Award className="w-10 h-10 text-[#d0c5af] mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-[#e1e2e9]">
            No credits found in this category.
          </p>
          <p className="text-xs text-[#d0c5af] mt-1">
            Click "Add Credit" to record a new performance entry.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a1d26] text-[11px] font-mono uppercase tracking-wider text-[#d0c5af] bg-[#0b0e13]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Production Title</th>
                <th className="py-3 px-4">Role / Character</th>
                <th className="py-3 px-4">Director / Company</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1d26] text-xs">
              {sortedCredits.map((credit) => (
                <tr
                  key={credit.id}
                  className="hover:bg-[#1a1d26]/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/20">
                      {credit.category || "Film"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#e1e2e9]">
                    {credit.production_name}
                  </td>
                  <td className="py-3 px-4 text-[#d0c5af]">
                    {credit.role_name || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-[#d0c5af]">
                    {credit.director || "N/A"}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#f2ca50]">
                    {credit.year || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        onDeleteCredit && onDeleteCredit(credit.id)
                      }
                      className="p-1 text-[#d0c5af] hover:text-[#ffb4ab] transition-colors"
                      title="Delete credit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Credit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111319] border border-[#1a1d26] rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#d0c5af] hover:text-[#e1e2e9]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#e1e2e9] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#f2ca50]" /> Add New Credit Entry
            </h3>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#d0c5af] mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
                >
                  <option value="Theater">Theater</option>
                  <option value="Film">Film</option>
                  <option value="Television">Television</option>
                  <option value="Commercials">Commercials</option>
                  <option value="Voiceover">Voiceover</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d0c5af] mb-1">
                  Production Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.production_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      production_name: e.target.value,
                    })
                  }
                  placeholder="e.g. Hamlet"
                  className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#d0c5af] mb-1">
                    Role / Character *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role_name}
                    onChange={(e) =>
                      setFormData({ ...formData, role_name: e.target.value })
                    }
                    placeholder="e.g. Hamlet (Lead)"
                    className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#d0c5af] mb-1">
                    Director / Network
                  </label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) =>
                      setFormData({ ...formData, director: e.target.value })
                    }
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d0c5af] mb-1">
                  Release / Production Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: parseInt(e.target.value) || 2024,
                    })
                  }
                  className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50] font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1a1d26] text-[#d0c5af] text-xs font-semibold hover:bg-[#252a36]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#f2ca50] text-[#0b0e13] text-xs font-bold hover:brightness-110"
                >
                  Save Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
