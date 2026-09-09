import React, { useState } from "react";
import { Play, Film, Clock, ExternalLink } from "lucide-react";
import LightboxModal from "./LightboxModal";

export default function VideoReelShowcase() {
  const [selectedReel, setSelectedReel] = useState(null);

  const reels = [
    {
      id: "reel-1",
      title: "Dramatic Acting Reel 2024 (HBO / Indie Feature)",
      media_type: "reel",
      thumbnail_url:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
      full_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      embed_code:
        '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Dramatic Reel" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
      runtime: "2m 14s",
      highlights:
        "Features lead scenes from City Lights (HBO) and Echoes of September (Sundance)",
    },
    {
      id: "reel-2",
      title: "Comedy & Monologue Showcase Reel",
      media_type: "reel",
      thumbnail_url:
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
      full_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      embed_code:
        '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Comedy Reel" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
      runtime: "1m 45s",
      highlights:
        "Quick-witted comedic dialogue and classical monologue performance",
    },
    {
      id: "reel-3",
      title: "Stage & Vocal Performance Reel (The Seagull / Musical)",
      media_type: "reel",
      thumbnail_url:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
      full_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      embed_code:
        '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Stage Reel" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
      runtime: "2m 50s",
      highlights:
        "Live Broadway theatrical excerpts and Mezzo-Soprano vocal selections",
    },
  ];

  return (
    <section className="flex flex-col gap-6 my-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-[#F59E0B]" />
          <h2 className="font-serif text-2xl font-bold text-white">
            Featured Video Reels
          </h2>
        </div>
        <span className="text-xs text-[#9CA3AF]">4K DCI Broadcast Quality</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reels.map((reel) => (
          <div
            key={reel.id}
            className="bg-[#0F131C] border border-white/10 rounded-xl overflow-hidden flex flex-col group hover:border-[#F59E0B]/50 transition-all shadow-xl"
          >
            <div className="aspect-video bg-[#181B25] relative overflow-hidden flex items-center justify-center">
              <img
                src={reel.thumbnail_url}
                alt={reel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <button
                  onClick={() => setSelectedReel(reel)}
                  className="w-12 h-12 rounded-full bg-[#F59E0B] text-[#0A0E17] flex items-center justify-center shadow-lg shadow-[#F59E0B]/30 hover:scale-110 transition-transform"
                  aria-label={`Play ${reel.title}`}
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </button>
              </div>
              <div className="absolute bottom-3 right-3 bg-[#0A0E17]/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-gray-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#F59E0B]" />
                <span>{reel.runtime}</span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-2 flex-grow justify-between">
              <div>
                <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#F59E0B] transition-colors">
                  {reel.title}
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                  {reel.highlights}
                </p>
              </div>

              <button
                onClick={() => setSelectedReel(reel)}
                className="text-xs font-semibold text-[#F59E0B] hover:underline flex items-center gap-1 mt-2 self-start"
              >
                <span>Watch Video Reel</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedReel && (
        <LightboxModal
          asset={selectedReel}
          onClose={() => setSelectedReel(null)}
        />
      )}
    </section>
  );
}
