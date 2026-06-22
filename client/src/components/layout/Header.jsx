import React from "react";

export default function Header({ activeTab }) {
  const getTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Overview";
      case "profile":
        return "Profile Management";
      case "maintenance":
        return "Maintenance Requests";
      case "payments":
        return "Outstanding Dues & Payments";
      case "facilities":
        return "Facility Bookings";
      case "visitors":
        return "Visitor Management";
      default:
        return "Overview";
    }
  };

  return (
    <header className="h-16 bg-[#0F172A] sticky top-0 z-40 flex items-center justify-between px-6 w-full border-b border-slate-800 shadow-sm backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-slate-200">{getTitle()}</h2>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-slate-200 transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
          <img
            className="w-full h-full object-cover"
            alt="User Avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0H-Uc-lRDP-6pC2OMh7dd2fIxDjtmbwsaQcDZNzyBSW1oKbKemnhOqPNLJ8A5Fvwk8kpfmbZfXRtFVfcjay0EXKnAsbsg4b7WTfNHAyj7K-b6zrno97u5wUGWE6zDV2i-R-adPGKjKwglCvg6reRLGbAj9UYvhZETOQQC6TFJumu3aDrSY7j1ZT2pxI0J41cLjmpsaP7PrWKNdpbYeWPvViqaydzS8uWdoIl4p_V2DVdArL2vW4xxivcb8w1uTxgImTLPHjMOzs0"
          />
        </div>
      </div>
    </header>
  );
}
