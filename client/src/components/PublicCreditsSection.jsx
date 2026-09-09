import React, { useState } from "react";
import { Award, Film, Tv, Mic, Sparkles } from "lucide-react";

export default function PublicCreditsSection({ credits = [] }) {
  const categories = [
    "All",
    "Theater",
    "Film",
    "Television",
    "Commercials",
    "Voiceover",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredCredits = credits.filter((credit) => {
    if (selectedCategory === "All") return true;
    return credit.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="bg-[#111319] border border-[#1a1d26] rounded-2xl p-6 md:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#1a1d26] mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#e1e2e9] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#f2ca50]" /> Filmography & Credits
          </h2>
          <p className="text-xs text-[#d0c5af] mt-1">
            Structured credits verified for casting directors and producers.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1 bg-[#0b0e13] p-1 rounded-lg border border-[#1a1d26]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#f2ca50] text-[#0b0e13]"
                  : "text-[#d0c5af] hover:text-[#e1e2e9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Credits Table */}
      {filteredCredits.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#1a1d26] rounded-xl bg-[#0b0e13]/50">
          <Award className="w-10 h-10 text-[#d0c5af] mx-auto mb-2 opacity-40" />
          <p className="text-xs text-[#d0c5af]">
            No credits listed under this category.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a1d26] text-[11px] font-mono uppercase tracking-wider text-[#d0c5af] bg-[#0b0e13]">
                <th className="py-3.5 px-4">Production</th>
                <th className="py-3.5 px-4">Role / Character</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Director / Network</th>
                <th className="py-3.5 px-4 text-right">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1d26] text-xs">
              {filteredCredits.map((credit) => (
                <tr
                  key={credit.id}
                  className="hover:bg-[#1a1d26]/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-[#e1e2e9]">
                    {credit.production_name}
                  </td>
                  <td className="py-3.5 px-4 text-[#d0c5af]">
                    {credit.role_name || "N/A"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/20">
                      {credit.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#d0c5af]">
                    {credit.director || "N/A"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#f2ca50]">
                    {credit.year || "N/A"}
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
