import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Play, Radio, Sparkles } from "lucide-react";

export default function HeroBanner({ artist }) {
  const name = artist?.name || "Karan Aujla";
  const bio =
    artist?.bio ||
    'Jaskaran Singh "Karan" Aujla is a global Punjabi music icon, singer, rapper, and songwriter celebrated for worldwide chart-topping hits like "Tauba Tauba", "Softly", "52 Bars", "Admirin\' You", "Winning Speech", and "White Brown Black". Born in Ghudani Kalan, Punjab, he has redefined Punjabi hip-hop with viral hooks, distinct vocals, and record-breaking sold-out world tours.';
  const monthlyListeners = artist?.monthly_listeners || 42500000;
  const heroImage =
    artist?.hero_image_url ||
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80";

  const stagePicture =
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1a1230] via-[#12121c] to-[#1a1a2e] border border-[#2d2d42] shadow-2xl p-6 sm:p-10 lg:p-12">
      {/* Background Stage Lights & Hero Image */}
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src={heroImage}
          alt={`${name} Stage Background`}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121c] via-[#12121c]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#12121c] via-transparent to-[#12121c]"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Bio & Info */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6">
          <div className="inline-flex items-center space-x-2 bg-[#7a3bed]/20 border border-[#7a3bed]/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#a855f7] tracking-widest uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#21c45c]" />
            <span>KARAN AUJLA • WORLD TOUR 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
            {name}
          </h1>

          <p className="text-sm sm:text-base text-[#9ea3b8] leading-relaxed max-w-2xl">
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
                World Tour 2026
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

        {/* Right Column: Prominent Stage Picture Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative group w-full max-w-sm rounded-2xl overflow-hidden border-2 border-[#7a3bed]/50 shadow-2xl shadow-[#7a3bed]/20 bg-[#1f1f2e]">
            <img
              src={stagePicture}
              alt="Karan Aujla Stage Picture"
              className="w-full h-80 sm:h-96 object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12121c] via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 bg-[#1f1f2e]/90 backdrop-blur-md border border-[#7a3bed]/40 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Karan Aujla Live Stage
                </span>
                <span className="text-[10px] text-[#21c45c] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#21c45c]" /> Official Stage
                  Performance
                </span>
              </div>
              <span className="bg-[#7a3bed] text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider">
                LIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
