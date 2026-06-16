import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children, currentPage, onNavigate, searchQuery, onSearchChange }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 antialiased overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <Header searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <main className="md:ml-[280px] pt-[64px] min-h-screen bg-[#0F172A] p-lg overflow-y-auto h-screen relative">
        {/* Decorative background elements */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="fixed bottom-0 left-[280px] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        <div className="max-w-7xl mx-auto space-y-lg relative z-10 pb-xl">
          {children}
        </div>
      </main>
    </div>
  );
}