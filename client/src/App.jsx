import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import TransferPage from "./pages/TransferPage.jsx";
import LedgerPage from "./pages/LedgerPage.jsx";
import { Send, History, ShieldAlert } from "lucide-react";

function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-slate-950 border-b border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-black text-white text-lg tracking-tight hover:opacity-90"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
            A
          </div>
          <span className="text-emerald-400">ApexBank</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
            P2P
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
              location.pathname === "/"
                ? "bg-slate-800 text-emerald-400 border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Transfer Portal
          </Link>
          <Link
            to="/ledger"
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
              location.pathname === "/ledger"
                ? "bg-slate-800 text-emerald-400 border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Audit Ledger
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<TransferPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="*" element={<TransferPage />} />
          </Routes>
        </main>
        <footer className="bg-slate-950 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 font-mono">
          ApexBank Secure Peer-to-Peer Money Transfer Module &copy;{" "}
          {new Date().getFullYear()}
        </footer>
      </div>
    </BrowserRouter>
  );
}
