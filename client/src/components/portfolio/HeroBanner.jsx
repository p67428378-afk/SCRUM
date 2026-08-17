import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Play, Radio } from "lucide-react";

export default function HeroBanner({ artist }) {
  const name = artist?.name || "Karan Aujla";
  const bio =
    artist?.bio ||
    "Acclaimed Punjabi singer, rapper, and songwriter known for chart-topping global hits like 'Tauba Tauba', 'Softly', and '52 Bars', infectious fusion beats, and record-breaking world tours.";
  const monthlyListeners = artist?.monthly_listeners || 42500000;
  const heroImage =
    artist?.hero_image_url ||
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1a1230] via-[#12121c] to-[#1a1a2e] border border-[#2d2d42] shadow-2xl">
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src={heroImage}
          alt={name}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121c] via-[#12121c]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#12121c] via-transparent to-[#12121c]"></div>
      </div>

      <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl flex flex-col items-start space-y-6">
        <div className="inline-flex items-center space-x-2 bg-[#7a3bed]/20 border border-[#7a3bed]/40 px-3 py-1.5 rounded-full text-xs font-bold text-[#a855f7] tracking-widest uppercase">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#21c45c]" />
          <span>AUJLA • WORLD TOUR 2026</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
          {name}
        </h1>

        <p className="text-base sm:text-lg text-[#9ea3b8] leading-relaxed max-w-2xl">
          {bio}
        </p>

        <div className="flex items-center space-x-6 py-2">
          <div className="text-left">
            <span className="block text-2xl font-bold text-white">
              {(monthlyListeners / 1000000).toFixed(1)}M+
            </span>
            <span className="text-xs text-[#9ea3b8] uppercase font-semibold">
              Monthly Listeners
            </span>
          </div>
          <div className="h-8 w-px bg-[#2d2d42]"></div>
          <div className="text-left">
            <span className="block text-2xl font-bold text-[#21c45c]">
              24 Cities
            </span>
            <span className="text-xs text-[#9ea3b8] uppercase font-semibold">
              4 Continents
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            to="/concerts"
            className="inline-flex items-center space-x-2 bg-[#7a3bed] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-[#7a3bed]/30 hover:bg-[#682bd6] transition-all transform hover:-translate-y-0.5"
          >
            <Calendar className="w-5 h-5" />
            <span>View Concert Schedule</span>
          </Link>

          <a
            href="#discography"
            className="inline-flex items-center space-x-2 bg-[#1f1f2e] text-white border border-[#2d2d42] px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#2a2a3d] transition-colors"
          >
            <Play className="w-4 h-4 text-[#7a3bed]" />
            <span>Discography</span>
          </a>
        </div>
      </div>
    </div>
  );
}
