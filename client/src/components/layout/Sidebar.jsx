import React from "react";

export default function Sidebar({ onNewTaskClick }) {
  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-[280px] bg-inverse-surface shadow-md flex-col py-xl px-md z-20">
      <div className="flex items-center gap-sm mb-2xl">
        <img
          className="w-10 h-10 rounded-full object-cover"
          alt="TaskMaster Avatar"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy2K10xFD68YkB8NH_RHzPQ5ATjuX8o08UU7empAo1P2Hk1hutIgmSWAROwIuFLrwEQJVbC6QExi7MSofnfq0rm916SR-P8qLhx9wQYIygaphK-YvEIrYuEWAgRFF4kbloqwNJA6Wpa-r7lom6I1v7laElMX5EuhgbBTmAQdgcyGnOUulHykHgsbXCu3EoCIil4MySGe_ynUyMT9f4sCYKh9qP8-_buE8kUroX7_AsPdL9hlzfIFDEH-9-2cZy9xXBdGAbwgigG98x"
        />
        <div>
          <h1 className="font-display text-primary-fixed-dim text-lg leading-tight font-bold">
            TaskMaster
          </h1>
          <p className="font-label-sm text-label-sm text-outline-variant">
            Enterprise Plan
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-sm flex-grow">
        <a
          className="border-l-4 border-primary-fixed-dim bg-white/10 text-primary-fixed-dim font-bold flex items-center gap-sm p-4 rounded-r-lg hover:bg-white/5 transition-colors scale-95 duration-150"
          href="#"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-body-md text-body-md">Dashboard</span>
        </a>
        <a
          className="text-outline-variant p-4 flex items-center gap-sm hover:bg-white/5 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">insights</span>
          <span className="font-body-md text-body-md">Analytics</span>
        </a>
        <a
          className="text-outline-variant p-4 flex items-center gap-sm hover:bg-white/5 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-md text-body-md">Settings</span>
        </a>
      </div>
      <div className="mt-auto flex flex-col gap-sm pt-xl border-t border-outline/20">
        <button
          onClick={onNewTaskClick}
          className="bg-primary text-on-primary py-2 px-4 rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-colors w-full mb-md shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          New Task
        </button>
        <a
          className="text-outline-variant p-4 flex items-center gap-sm hover:bg-white/5 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-body-md text-body-md">Support</span>
        </a>
        <a
          className="text-outline-variant p-4 flex items-center gap-sm hover:bg-white/5 transition-colors"
          href="#"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-md text-body-md">Logout</span>
        </a>
      </div>
    </nav>
  );
}
