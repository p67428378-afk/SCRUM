import React from "react";
import { Disc, Music, Disc3 } from "lucide-react";

export default function DiscographySection({ discography = [] }) {
  const fallbackDiscography = [
    {
      id: "d1",
      title: "Neon Odyssey",
      release_year: 2025,
      cover_image_url:
        "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80",
      track_count: 12,
    },
    {
      id: "d2",
      title: "Midnight Echoes",
      release_year: 2023,
      cover_image_url:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
      track_count: 10,
    },
    {
      id: "d3",
      title: "Starlight Horizons",
      release_year: 2021,
      cover_image_url:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
      track_count: 14,
    },
  ];

  const items = discography.length > 0 ? discography : fallbackDiscography;

  return (
    <section id="discography" className="py-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#7a3bed]/20 text-[#a855f7] flex items-center justify-center">
          <Disc3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Discography Highlights
          </h2>
          <p className="text-xs text-[#9ea3b8]">
            Chart-topping studio albums and hit singles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((album) => (
          <div
            key={album.id || album.title}
            className="bg-[#1f1f2e] border border-[#2d2d42] rounded-2xl p-4 flex items-center space-x-4 hover:border-[#7a3bed]/50 transition-all hover:shadow-xl hover:shadow-[#7a3bed]/10 group"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#12121c] flex-shrink-0 relative">
              <img
                src={
                  album.cover_image_url ||
                  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80"
                }
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80";
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#7a3bed] uppercase tracking-wider block mb-1">
                Studio Album • {album.release_year}
              </span>
              <h3 className="text-base font-bold text-white truncate group-hover:text-[#a855f7] transition-colors">
                {album.title}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-[#9ea3b8] mt-2">
                <Music className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>{album.track_count} Tracks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
