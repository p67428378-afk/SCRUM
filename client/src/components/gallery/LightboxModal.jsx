import React from "react";
import {
  X,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { generatePressKitDownload } from "../../services/api";

export default function LightboxModal({ asset, onClose }) {
  if (!asset) return null;

  const isReel = asset.media_type === "reel";

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0A0E17]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0F131C] border border-[#F59E0B]/30 rounded-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181B25]">
          <div className="flex items-center gap-2 pr-4 truncate">
            {isReel ? (
              <Film className="w-5 h-5 text-[#F59E0B] shrink-0" />
            ) : (
              <ImageIcon className="w-5 h-5 text-[#F59E0B] shrink-0" />
            )}
            <h3 className="font-serif text-lg font-bold text-white truncate">
              {asset.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Lightbox"
            className="p-1.5 rounded-full bg-[#0F131C] text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: Media Preview */}
        <div className="flex-1 bg-black/80 flex items-center justify-center p-4 overflow-hidden min-h-[300px] sm:min-h-[450px]">
          {isReel ? (
            <div className="w-full h-full aspect-video rounded-lg overflow-hidden border border-white/10 shadow-xl">
              {asset.embed_code ? (
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: asset.embed_code }}
                />
              ) : (
                <iframe
                  src={asset.full_url}
                  title={asset.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          ) : (
            <img
              src={asset.full_url || asset.thumbnail_url}
              alt={asset.title}
              className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[#181B25] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#9CA3AF]">
            <span className="text-white font-semibold">{asset.title}</span> •
            High Resolution Press Asset
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {asset.download_url ? (
              <a
                href={asset.download_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex-1 sm:flex-none bg-[#F59E0B] text-[#0A0E17] px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#D97706] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res</span>
              </a>
            ) : (
              <button
                onClick={generatePressKitDownload}
                className="flex-1 sm:flex-none bg-[#F59E0B] text-[#0A0E17] px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#D97706] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Press Kit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#0F131C] text-[#9CA3AF] hover:text-white border border-white/10 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
