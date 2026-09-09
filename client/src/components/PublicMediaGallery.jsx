import React, { useState } from "react";
import { Image as ImageIcon, Play, Film, X, ExternalLink } from "lucide-react";

export default function PublicMediaGallery({ mediaItems = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const headshots = mediaItems.filter((item) => item.asset_type === "headshot");
  const reels = mediaItems.filter((item) => item.asset_type === "reel");

  return (
    <div className="space-y-8">
      {/* Headshots Gallery */}
      <div className="bg-[#111319] border border-[#1a1d26] rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#e1e2e9] mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#f2ca50]" /> Headshots & Gallery
        </h2>

        {headshots.length === 0 ? (
          <p className="text-xs text-[#d0c5af] py-6 text-center border border-dashed border-[#1a1d26] rounded-xl">
            No headshots uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {headshots.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item.url)}
                className="group relative aspect-[3/4] bg-[#0b0e13] border border-[#1a1d26] rounded-xl overflow-hidden cursor-pointer hover:border-[#f2ca50] transition-all"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-xs font-bold text-[#e1e2e9] truncate">
                    {item.title}
                  </span>
                  {item.is_primary && (
                    <span className="text-[10px] text-[#f2ca50] font-mono">
                      Primary Headshot
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Reels Section */}
      <div className="bg-[#111319] border border-[#1a1d26] rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#e1e2e9] mb-4 flex items-center gap-2">
          <Film className="w-5 h-5 text-[#f2ca50]" /> Performance Reels & Demos
        </h2>

        {reels.length === 0 ? (
          <p className="text-xs text-[#d0c5af] py-6 text-center border border-dashed border-[#1a1d26] rounded-xl">
            No video reels attached.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className="bg-[#0b0e13] border border-[#1a1d26] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#e1e2e9] flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#f2ca50]" /> {reel.title}
                  </h3>
                  <a
                    href={reel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#f2ca50] hover:underline flex items-center gap-1"
                  >
                    Watch <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="aspect-video bg-[#1a1d26] rounded-lg overflow-hidden flex items-center justify-center relative border border-[#1a1d26]">
                  {reel.url.includes("youtube.com") ||
                  reel.url.includes("youtu.be") ? (
                    <iframe
                      src={reel.url.replace("watch?v=", "embed/")}
                      title={reel.title}
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <Play className="w-10 h-10 text-[#f2ca50] mx-auto opacity-80" />
                      <p className="text-xs text-[#e1e2e9] font-medium">
                        {reel.title}
                      </p>
                      <a
                        href={reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 bg-[#f2ca50] text-[#0b0e13] text-xs font-bold rounded-md"
                      >
                        Play Video Reel
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md cursor-pointer"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Full Headshot View"
            className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl border border-[#f2ca50]/30"
          />
        </div>
      )}
    </div>
  );
}
