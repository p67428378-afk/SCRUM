import React from "react";
import TransferPortal from "./components/TransferPortal.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
              ⚡
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                SecureBank
              </span>
              <span className="text-xs font-mono text-emerald-400 block -mt-1">
                P2P TRANSFER ENGINE
              </span>
            </div>
          </div>
          <nav className="flex items-center space-x-6 text-sm">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Gateway
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <TransferPortal />
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-center text-xs text-slate-400">
        <p>
          SecureBank P2P Transfer Module &copy; {new Date().getFullYear()}.
          Real-Time Fraud &amp; Balance Protection Active.
        </p>
      </footer>
    </div>
  );
}
