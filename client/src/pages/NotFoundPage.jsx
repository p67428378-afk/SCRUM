import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Search, AlertCircle, ArrowLeft, UserCheck } from "lucide-react";

export default function NotFoundPage({ requestedSlug = "" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const featuredTalent = [
    { name: "John Doe", slug: "john-doe", role: "Dramatic / Classical" },
    { name: "Jane Smith", slug: "jane-smith", role: "Commercial / Television" },
    { name: "Alex Rivera", slug: "alex-rivera", role: "Voiceover / Film" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const formattedSlug = searchQuery
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      navigate(`/actors/${formattedSlug}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e13] text-[#e1e2e9] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 bg-[#f2ca50]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl w-full bg-[#111319] border border-[#1a1d26] rounded-2xl p-8 text-center space-y-6 shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 flex items-center justify-center text-[#ffb4ab] mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#f2ca50]">
            404 &bull; PROFILE NOT FOUND
          </span>
          <h1 className="text-3xl font-extrabold text-[#e1e2e9] mt-2">
            Actor Portfolio Unavailable
          </h1>
          <p className="text-xs text-[#d0c5af] mt-2 leading-relaxed">
            The portfolio URL{" "}
            <code className="text-[#f2ca50] font-mono bg-[#0b0e13] px-2 py-0.5 rounded">
              /actors/{requestedSlug || "unknown"}
            </code>{" "}
            does not match any registered talent in our casting database.
          </p>
        </div>

        {/* Search Bar for Roster Recovery */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-[#d0c5af] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search actor name or slug..."
            className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-xl pl-9 pr-24 py-2.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#f2ca50] text-[#0b0e13] font-bold text-xs rounded-lg hover:brightness-110"
          >
            Find Talent
          </button>
        </form>

        {/* Featured Talent Suggestions */}
        <div className="pt-4 border-t border-[#1a1d26] text-left">
          <h3 className="text-xs font-bold text-[#d0c5af] uppercase tracking-wider mb-3">
            Suggested Roster Talent
          </h3>
          <div className="space-y-2">
            {featuredTalent.map((talent) => (
              <Link
                key={talent.slug}
                to={`/actors/${talent.slug}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b0e13] border border-[#1a1d26] hover:border-[#f2ca50]/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#f2ca50]" />
                  <span className="text-xs font-bold text-[#e1e2e9] group-hover:text-[#f2ca50]">
                    {talent.name}
                  </span>
                </div>
                <span className="text-[10px] text-[#d0c5af]">
                  {talent.role}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#f2ca50] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Actor Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
