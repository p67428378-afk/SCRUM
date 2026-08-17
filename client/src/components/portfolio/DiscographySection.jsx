import React from "react";
import { Disc3, Music, Play, ListMusic } from "lucide-react";

const KARAN_AUJLA_ALBUMS = [
  {
    id: "d1",
    title: "Making Memories",
    release_year: 2023,
    cover_image_url:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80",
    track_count: 9,
    songs: [
      "Softly",
      "Admirin' You",
      "Try Me",
      "Champion's Anthem",
      "Girl, I Love You",
      "JEE'S",
      "What?",
      "You",
      "Bachke Bachke",
    ],
  },
  {
    id: "d2",
    title: "Four You",
    release_year: 2023,
    cover_image_url:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    track_count: 4,
    songs: ["52 Bars", "Take It Easy", "Fallin Apart", "Yeah Naah"],
  },
  {
    id: "d3",
    title: "BTFU (Bacthafucup)",
    release_year: 2021,
    cover_image_url:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    track_count: 13,
    songs: [
      "Chu Gon Do?",
      "Click That Bhaia",
      "Here & There",
      "Ask About Me",
      "Sharabi",
    ],
  },
  {
    id: "d4",
    title: "Street Dreams",
    release_year: 2024,
    cover_image_url:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
    track_count: 7,
    songs: [
      "100 Million",
      "Nothing Lasts",
      "Straight Ballin'",
      "Street Dreams",
      "Top Class",
    ],
  },
  {
    id: "d5",
    title: "Four Me",
    release_year: 2024,
    cover_image_url:
      "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80",
    track_count: 4,
    songs: ["Winning Speech", "Antidote", "MF", "I'm Better Now"],
  },
  {
    id: "d6",
    title: "Tauba Tauba & Chart-Toppers",
    release_year: 2024,
    cover_image_url:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    track_count: 6,
    songs: [
      "Tauba Tauba",
      "White Brown Black",
      "On Top",
      "Players",
      "Mexicana",
      "Don't Look",
    ],
  },
];

const INVALID_ALBUM_KEYWORDS = [
  "midnight echoes",
  "whispers in the wind",
  "ethereal",
  "ethereals",
];

export default function DiscographySection({ discography = [] }) {
  // Filter out any incorrect/generic albums if received from backend or cache
  const validDiscography = (discography || []).filter((album) => {
    const titleLower = (album.title || "").toLowerCase();
    return !INVALID_ALBUM_KEYWORDS.some((kw) => titleLower.includes(kw));
  });

  const items =
    validDiscography.length > 0 ? validDiscography : KARAN_AUJLA_ALBUMS;

  return (
    <section id="discography" className="py-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#7a3bed]/20 text-[#a855f7] flex items-center justify-center">
          <Disc3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">
            Discography & Official Albums
          </h2>
          <p className="text-xs text-[#9ea3b8]">
            Explore Karan Aujla's real chart-topping albums, hit EPs, and
            worldwide Punjabi anthems
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((album) => {
          const songs =
            album.songs && Array.isArray(album.songs) && album.songs.length > 0
              ? album.songs
              : [
                  "Tauba Tauba",
                  "Softly",
                  "52 Bars",
                  "Admirin' You",
                  "Winning Speech",
                  "White Brown Black",
                ];

          return (
            <div
              key={album.id || album.title}
              className="bg-[#1f1f2e] border border-[#2d2d42] rounded-2xl p-5 flex flex-col justify-between hover:border-[#7a3bed]/50 transition-all hover:shadow-xl hover:shadow-[#7a3bed]/10 group"
            >
              <div>
                <div className="flex items-center space-x-4 mb-4">
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
                      Karan Aujla Release • {album.release_year || 2023}
                    </span>
                    <h3 className="text-base font-bold text-white truncate group-hover:text-[#a855f7] transition-colors">
                      {album.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-[#9ea3b8] mt-1.5">
                      <Music className="w-3.5 h-3.5 text-[#a855f7]" />
                      <span>{album.track_count || songs.length} Tracks</span>
                    </div>
                  </div>
                </div>

                {/* Featured Songs list */}
                <div className="bg-[#12121c] border border-[#2d2d42] rounded-xl p-3 space-y-2">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#a855f7] uppercase tracking-wider">
                    <ListMusic className="w-3.5 h-3.5" />
                    <span>Featured Tracks</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {songs.map((song, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 bg-[#1f1f2e] border border-[#2d2d42] px-2.5 py-1 rounded-lg text-xs font-medium text-white hover:border-[#7a3bed]/60 hover:text-[#a855f7] transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 text-[#21c45c]" />
                        <span>{song}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
