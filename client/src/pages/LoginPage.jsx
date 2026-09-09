import React from "react";
import { AuthCard } from "../components/AuthCard";
import { BookOpen, ShieldCheck, Bookmark, Sparkles } from "lucide-react";

export const LoginPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#f9f9ff]">
      {/* Left Artwork & Brand Hero (Desktop) */}
      <div className="lg:w-1/2 bg-[#122338] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#0d6847]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#a12228]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-emerald-300 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Athenaeum Digital Repository</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
            Preserving Wisdom, <br />
            <span className="italic text-emerald-400">Empowering Minds.</span>
          </h1>
          <p className="mt-4 text-gray-300 text-sm sm:text-base max-w-md leading-relaxed">
            Welcome to the Athenaeum Archives portal. Access thousands of
            catalogued literary works, manage borrowing history, and track
            circulation in real-time.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 my-8 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-[#1f3552] rounded-lg text-emerald-400 mt-1">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Curated Book Catalog</h4>
              <p className="text-xs text-gray-300">
                Browse by title, author, genre, and real-time inventory counts.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-[#1f3552] rounded-lg text-emerald-400 mt-1">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Circulation & Renewals</h4>
              <p className="text-xs text-gray-300">
                Seamless 14-day loan checkouts with instant one-click renewals.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-[#1f3552] rounded-lg text-emerald-400 mt-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">
                Administrative Governance
              </h4>
              <p className="text-xs text-gray-300">
                Centralized inventory control, overdue loan monitoring, and
                member audits.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-gray-400 border-t border-gray-800 pt-6">
          &copy; {new Date().getFullYear()} Athenaeum Library Management System.
          All rights reserved.
        </div>
      </div>

      {/* Right Auth Card Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <AuthCard />
      </div>
    </div>
  );
};
