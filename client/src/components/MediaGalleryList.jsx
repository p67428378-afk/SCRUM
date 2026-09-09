import React, { useState } from "react";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Star,
  Trash2,
  ExternalLink,
  Play,
  Check,
} from "lucide-react";

export default function MediaGalleryList({
  mediaItems = [],
  onSetPrimary,
  onDeleteMedia,
}) {
  const [filter, setFilter] = useState("all"); // 'all', 'headshot', 'reel', 'resume'

  const filteredItems = mediaItems.filter((item) => {
    if (filter === "all") return true;
    return item.asset_type === filter;
  });

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " MB";
  };

  return (
    <div className="bg-[#111319] border border-[#1a1d26] rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1a1d26] mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#e1e2e9] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#f2ca50]" />
            Media Gallery & Assets
          </h2>
          <p className="text-xs text-[#d0c5af] mt-1">
            Manage headshots, primary profile photo, video reels, and PDF
            resumes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-[#0b0e13] p-1 rounded-lg border border-[#1a1d26] self-start sm:self-auto">
          {["all", "headshot", "reel", "resume"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-[#f2ca50] text-[#0b0e13]"
                  : "text-[#d0c5af] hover:text-[#e1e2e9]"
              }`}
            >
              {f === "all" ? "All Assets" : f + "s"}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#1a1d26] rounded-xl bg-[#0b0e13]/50">
          <ImageIcon className="w-10 h-10 text-[#d0c5af] mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-[#e1e2e9]">
            No media assets found in this category.
          </p>
          <p className="text-xs text-[#d0c5af] mt-1">
            Upload a headshot or link a video reel above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`relative group bg-[#0b0e13] border rounded-xl overflow-hidden transition-all flex flex-col justify-between ${
                item.is_primary
                  ? "border-[#f2ca50] shadow-lg shadow-[#f2ca50]/10"
                  : "border-[#1a1d26] hover:border-[#f2ca50]/40"
              }`}
            >
              {/* Media Preview Header */}
              <div className="relative aspect-video bg-[#1a1d26] flex items-center justify-center overflow-hidden">
                {item.asset_type === "headshot" ? (
                  item.url ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-[#d0c5af]/40" />
                  )
                ) : item.asset_type === "reel" ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#f2ca50]/20 border border-[#f2ca50]/40 flex items-center justify-center text-[#f2ca50] mb-2 group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 ml-0.5" />
                    </div>
                    <span className="text-xs font-mono text-[#f2ca50]">
                      PERFORMANCE REEL
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <FileText className="w-10 h-10 text-[#f2ca50] mb-1" />
                    <span className="text-xs font-mono text-[#d0c5af]">
                      PDF RESUME
                    </span>
                  </div>
                )}

                {/* Primary Headshot Badge */}
                {item.is_primary && (
                  <div className="absolute top-2 left-2 bg-[#f2ca50] text-[#0b0e13] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-[#0b0e13]" />
                    PRIMARY HEADSHOT
                  </div>
                )}
              </div>

              {/* Asset Info Body */}
              <div className="p-3">
                <h4
                  className="text-xs font-bold text-[#e1e2e9] truncate"
                  title={item.title}
                >
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-[#d0c5af] mt-1">
                  <span className="capitalize">{item.asset_type}</span>
                  <span>{formatFileSize(item.file_size_bytes)}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 pt-0 flex items-center justify-between border-t border-[#1a1d26] mt-2">
                {item.asset_type === "headshot" && !item.is_primary ? (
                  <button
                    onClick={() => onSetPrimary && onSetPrimary(item.id)}
                    className="text-[11px] font-semibold text-[#f2ca50] hover:underline flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" /> Make Primary
                  </button>
                ) : (
                  <span className="text-[10px] text-[#d0c5af]">
                    {item.is_primary ? "Primary photo" : "Asset"}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#d0c5af] hover:text-[#f2ca50] transition-colors"
                      title="Open full view"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => onDeleteMedia && onDeleteMedia(item.id)}
                    className="p-1.5 text-[#d0c5af] hover:text-[#ffb4ab] transition-colors"
                    title="Delete asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
