import React, { useState, useEffect } from "react";
import { ZoomIn, Download, Play, Image, Film, Sparkles } from "lucide-react";
import { fetchGallery, generatePressKitDownload } from "../../services/api";
import LightboxModal from "./LightboxModal";

export default function MediaGalleryGrid() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    async function loadGallery() {
      setLoading(true);
      const data = await fetchGallery(activeFilter);
      setGalleryItems(data);
      setLoading(false);
    }
    loadGallery();
  }, [activeFilter]);

  const filterButtons = [
    { key: "all", label: "All Media" },
    { key: "headshot", label: "Headshots & Stills" },
    { key: "reel", label: "Video Reels" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveFilter(btn.key)}
              className={
                activeFilter === btn.key
                  ? "bg-[#F59E0B] text-[#0A0E17] px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md shadow-[#F59E0B]/20"
                  : "bg-[#181B25] text-[#9CA3AF] hover:text-white border border-white/10 px-5 py-2 rounded-full text-xs font-semibold transition-all hover:border-white/20"
              }
            >
              {btn.label}
            </button>
          ))}
        </div>

        <button
          onClick={generatePressKitDownload}
          className="text-[#F59E0B] hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors bg-[#181B25] px-3.5 py-1.5 rounded-md border border-[#F59E0B]/30"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Press Kit Download</span>
        </button>
      </div>

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="text-center py-16 bg-[#0F131C] rounded-lg border border-white/10">
          <p className="text-[#9CA3AF] text-sm">
            No media items found for this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#0F131C] border border-white/10 rounded-xl overflow-hidden group hover:border-[#F59E0B]/50 transition-all duration-300 flex flex-col shadow-lg shadow-black/40"
            >
              <div className="aspect-[3/4] bg-[#181B25] relative overflow-hidden flex items-center justify-center">
                <img
                  src={
                    item.thumbnail_url ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Media Type Badge Overlay */}
                <div className="absolute top-3 left-3 bg-[#0F131C]/80 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider border border-[#F59E0B]/30 flex items-center gap-1">
                  {item.media_type === "reel" ? (
                    <>
                      <Film className="w-3 h-3" />
                      <span>Video Reel</span>
                    </>
                  ) : (
                    <>
                      <Image className="w-3 h-3" />
                      <span>Headshot</span>
                    </>
                  )}
                </div>

                {/* Hover Action Trigger */}
                <div className="absolute inset-0 bg-[#0A0E17]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <button
                    onClick={() => setSelectedAsset(item)}
                    className="bg-[#F59E0B] text-[#0A0E17] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xl hover:bg-[#D97706] transition-transform active:scale-95"
                  >
                    {item.media_type === "reel" ? (
                      <Play className="w-4 h-4 fill-current" />
                    ) : (
                      <ZoomIn className="w-4 h-4" />
                    )}
                    <span>
                      {item.media_type === "reel"
                        ? "Play Video Reel"
                        : "Zoom Lightbox"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#0F131C] flex justify-between items-center border-t border-white/5">
                <div className="flex flex-col truncate pr-2">
                  <span className="text-xs font-semibold text-white truncate">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] capitalize">
                    {item.media_type} Asset
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAsset(item)}
                  className="text-[#F59E0B] text-xs font-medium hover:underline shrink-0 flex items-center gap-1"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedAsset && (
        <LightboxModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}
