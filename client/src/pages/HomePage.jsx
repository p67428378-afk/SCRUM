import React from "react";
import HeaderNav from "../components/common/HeaderNav";
import Footer from "../components/common/Footer";
import HeroBio from "../components/home/HeroBio";
import VideoReelShowcase from "../components/gallery/VideoReelShowcase";
import FilmographyTable from "../components/credits/FilmographyTable";
import { NavLink } from "react-router-dom";
import { ArrowRight, Film, Award, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-[#F9FAFB] flex flex-col justify-between">
      <div>
        <HeaderNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-16">
          {/* Hero & Biography Section */}
          <HeroBio />

          {/* Featured Video Reels Showcase */}
          <VideoReelShowcase />

          {/* Featured Filmography Highlights Section */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[#F59E0B] text-xs font-bold uppercase tracking-widest">
                  Select Credits
                </span>
                <h2 className="font-serif text-3xl font-bold text-white mt-1">
                  Featured Filmography
                </h2>
              </div>
              <NavLink
                to="/credits"
                className="text-[#F59E0B] hover:text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors bg-[#181B25] px-4 py-2 rounded-lg border border-[#F59E0B]/30"
              >
                <span>View Full Filmography</span>
                <ArrowRight className="w-4 h-4" />
              </NavLink>
            </div>

            <FilmographyTable />
          </section>

          {/* Booking CTA Banner */}
          <section className="bg-gradient-to-r from-[#0F131C] via-[#181B25] to-[#0F131C] border border-[#F59E0B]/30 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-48 h-48 text-[#F59E0B]" />
            </div>
            <span className="text-[#F59E0B] text-xs uppercase font-bold tracking-widest bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/30">
              SAG-AFTRA • Dual US/UK Citizen
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white max-w-2xl leading-tight">
              Available for Theatrical & Motion Picture Engagements Worldwide
            </h2>
            <p className="text-[#9CA3AF] text-sm max-w-xl leading-relaxed">
              Submit audition sides, script breakdowns, or booking inquiries
              directly to Creative Artists Agency (CAA).
            </p>
            <NavLink
              to="/contact"
              className="bg-[#F59E0B] text-[#0A0E17] px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#D97706] transition-all shadow-xl shadow-[#F59E0B]/20 active:scale-95 flex items-center gap-2"
            >
              <span>Submit Booking Inquiry</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
