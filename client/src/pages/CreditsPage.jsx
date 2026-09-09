import React from "react";
import HeaderNav from "../components/common/HeaderNav";
import Footer from "../components/common/Footer";
import FilmographyTable from "../components/credits/FilmographyTable";
import { Film, Download } from "lucide-react";
import { generatePressKitDownload } from "../services/api";

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-[#F9FAFB] flex flex-col justify-between">
      <div>
        <HeaderNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-10">
          {/* Page Title & Intro */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-bold uppercase tracking-widest">
                <Film className="w-4 h-4" />
                <span>Experience Resume</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-1">
                Filmography & Acting Credits
              </h1>
              <p className="text-[#9CA3AF] text-sm max-w-2xl mt-1">
                Categorized experience spanning Television series, Feature
                Films, Broadway Stage productions, and Global Commercial
                campaigns.
              </p>
            </div>

            <button
              onClick={generatePressKitDownload}
              className="bg-[#181B25] text-[#F59E0B] border border-[#F59E0B]/30 hover:border-[#F59E0B] px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Resume</span>
            </button>
          </div>

          {/* Filmography Table Component */}
          <FilmographyTable />
        </main>
      </div>

      <Footer />
    </div>
  );
}
