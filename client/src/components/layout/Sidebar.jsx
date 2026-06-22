import React from "react";

export default function Sidebar({ activeTab, setActiveTab, residentName }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "profile", label: "Profile", icon: "person" },
    { id: "maintenance", label: "Maintenance", icon: "build" },
    { id: "payments", label: "Payments", icon: "payments" },
    { id: "facilities", label: "Facilities", icon: "apartment" },
    { id: "visitors", label: "Visitors", icon: "group" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#0F172A] flex flex-col py-6 px-4 z-50 border-r border-slate-800">
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-bold text-[#c0c1ff] tracking-tight">
          ResiEase
        </h1>
        <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">
          Resident Portal
        </p>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-4 py-2 rounded-lg border-l-4 transition-all text-left ${
                isActive
                  ? "border-[#6366F1] bg-[rgba(99,102,241,0.1)] text-[#6366F1] font-semibold"
                  : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t border-slate-800">
        <button
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-4 px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg w-full text-left"
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="truncate">{residentName || "John Doe"}</span>
        </button>
      </div>
    </aside>
  );
}
