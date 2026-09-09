import React from "react";
import {
  Download,
  Award,
  Star,
  Film,
  GraduationCap,
  Building,
} from "lucide-react";
import { generatePressKitDownload } from "../../services/api";

export default function HeroBio() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left Column: Primary Headshot Card & Press Kit Download */}
      <section className="lg:col-span-5 bg-[#0F131C] border border-[#F59E0B]/20 rounded-xl p-6 flex flex-col gap-6 shadow-2xl shadow-black/50">
        <div className="aspect-[3/4] bg-[#181B25] rounded-lg border border-white/10 overflow-hidden relative group">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
            alt="Elena Vance Studio Headshot"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <span className="text-[#F59E0B] text-xs font-bold uppercase tracking-widest bg-[#0F131C]/90 px-3 py-1 rounded-full border border-[#F59E0B]/30 backdrop-blur">
              Primary Studio Headshot (8K DCI)
            </span>
          </div>
        </div>

        <button
          onClick={generatePressKitDownload}
          className="w-full bg-[#F59E0B] text-[#0A0E17] py-3.5 px-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#D97706] transition-all shadow-lg shadow-[#F59E0B]/20 active:scale-98"
        >
          <Download className="w-5 h-5" />
          <span>Download Press Kit (ZIP/PDF)</span>
        </button>
      </section>

      {/* Right Column: Bio Details, Union Affiliation, Stats Grid */}
      <section className="lg:col-span-7 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[#F59E0B] text-xs uppercase tracking-widest font-bold bg-[#F59E0B]/10 px-3 py-1.5 rounded-full border border-[#F59E0B]/30 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            Juilliard School Alumna
          </span>
          <span className="text-[#9CA3AF] text-xs uppercase tracking-widest font-semibold bg-[#181B25] px-3 py-1.5 rounded-full border border-white/10">
            SAG-AFTRA Member
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Elena Vance
        </h1>

        <p className="text-[#F59E0B] text-lg font-medium italic">
          "Classically trained screen and stage actress recognized for her
          gripping lead performance as Clara Thorne in HBO's critically
          acclaimed drama series City Lights."
        </p>

        <p className="text-[#9CA3AF] text-base leading-relaxed">
          With over a decade of dramatic training at The Juilliard School and
          New York's Public Theater, Elena Vance seamlessly transitions between
          complex television leads, award-winning indie feature films, and
          classical theater stage productions. She holds dual citizenship
          (US/UK) and is available for global theatrical engagements.
        </p>

        {/* Key Portfolio Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#181B25] p-6 rounded-xl border border-white/10 mt-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-3xl font-extrabold text-[#F59E0B]">14</span>
            </div>
            <span className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">
              Acting Credits
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-3xl font-extrabold text-[#F59E0B]">3</span>
            </div>
            <span className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">
              Award Nominations
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-3xl font-extrabold text-[#F59E0B]">
                CAA
              </span>
            </div>
            <span className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">
              Global Management
            </span>
          </div>
        </div>

        {/* Special Skills / Attributes Summary */}
        <div className="bg-[#0F131C] p-6 rounded-xl border border-white/10 flex flex-col gap-3">
          <h3 className="text-xs uppercase font-bold tracking-widest text-[#F59E0B]">
            Core Attributes & Special Skills
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-[#181B25] text-gray-300 px-3 py-1 rounded-md border border-white/5">
              Height: 5'8"
            </span>
            <span className="bg-[#181B25] text-gray-300 px-3 py-1 rounded-md border border-white/5">
              Hair: Auburn / Dark Brown
            </span>
            <span className="bg-[#181B25] text-gray-300 px-3 py-1 rounded-md border border-white/5">
              Eyes: Hazel
            </span>
            <span className="bg-[#181B25] text-gray-300 px-3 py-1 rounded-md border border-white/5">
              Dialects: Received Pronunciation (RP), Irish, General American
            </span>
            <span className="bg-[#181B25] text-gray-300 px-3 py-1 rounded-md border border-white/5">
              Vocal: Mezzo-Soprano (Stage/Musical)
            </span>
            <span className="bg-[#181B25] text-gray-300 px-3 py-1 rounded-md border border-white/5">
              Stage Combat (Certified)
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
