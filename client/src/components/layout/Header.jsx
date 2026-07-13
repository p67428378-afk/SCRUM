import React from "react";

export default function Header() {
  return (
    <header className="bg-surface-container-lowest text-primary docked full-width top-0 h-[64px] border-b border-outline-variant flat no shadows flex justify-between items-center px-lg w-full fixed top-0 z-50">
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 bg-slate-800 rounded flex items-center justify-center overflow-hidden">
          <img
            className="w-full h-full object-cover"
            alt="DG Logo"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2uUM3t4gSSKhk71z20wljOzrBNT2OH34t4f5lHtVjCirCk3AzFsd4t1dax93quPRGFhD9CDJDHc-qOInAdVBzS13Cv_pVC1d7UrIHW57zk3pnkoNltrFLNWuRc_jGBS0xt3A0FmLT0Qm-DksV3qlj4hrvA8kBkOGXChXGhvu0bmUo7j5j7xlC6HaaCo4HEOgodu-6GmU_QTmPq8idhQ-3DgEnIpNJQiyA_XhSS8Is8xXT8zCFqOale6dE8NpN3wlrDU0vtChX4tqu"
          />
        </div>
        <div>
          <h1 className="font-display-md text-display-md font-bold text-secondary">
            DG Cluster Assortment Advisor
          </h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant">
            Small Town Value Cluster — Snacks Category
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-6 text-on-surface-variant">
        <div className="font-mono-label text-mono-label">Data as of: Today</div>
        <div className="flex items-center space-x-3 border-l border-outline-variant pl-6">
          <div className="text-right">
            <div className="font-data-tabular text-data-tabular text-white">
              Marcus Vance
            </div>
            <div className="font-label-caps text-label-caps text-slate-400">
              Category Manager
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
            <img
              className="w-full h-full object-cover"
              alt="Marcus Vance"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKA-rmiYD2NTo41Hq2wWkjLCquzbP4gKSBvP1vkaH0C7M1Qsr--gYOF1PK5qfBGYKlcm6rKkoNnVsCg8a_a5Rrn0rBzwwgWI-CpmpgcmyVPGSdhbG4-f48Zo5VeFdCXNnwCRWjfVnTFhEDLg4cX0RlabBaJp_8-Bj5y6CwvHV2jBvFRxTxntxgNOJZZJircbrwhaVIeIWVSzR-CrjKxW29JrqFwMekHK7SE3NoDaRuHnd9nzLbhb31GbeL2a76W2JjI1LfxKpiqDPG"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
