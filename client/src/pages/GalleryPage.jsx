import React from "react";
import HeaderNav from "../components/common/HeaderNav";
import Footer from "../components/common/Footer";
import MediaGalleryGrid from "../components/gallery/MediaGalleryGrid";
import VideoReelShowcase from "../components/gallery/VideoReelShowcase";
import { Camera, Film } from "lucide-react";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-[#F9FAFB] flex flex-col justify-between">
      <div>
        <HeaderNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-12">
          {/* Page Title Header */}
          <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-bold uppercase tracking-widest">
              <Camera className="w-4 h-4" />
              <span>Media Portfolio</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Headshots, Stills & Video Reels
            </h1>
            <p className="text-[#9CA3AF] text-sm max-w-2xl mt-1">
              High-resolution 8K DCI headshots, production stills, and broadcast
              4K video reels. Click any asset to launch the full-screen lightbox
              or download press kit materials.
            </p>
          </div>

          {/* Media Gallery Section */}
          <MediaGalleryGrid />

          {/* Video Reel Showcase Section */}
          <VideoReelShowcase />
        </main>
      </div>

      <Footer />
    </div>
  );
}
