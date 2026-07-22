import React from "react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "audit-logs", label: "Audit Logs", icon: "history" },
    { id: "export-settings", label: "Export Settings", icon: "import_export" },
    { id: "access-control", label: "Access Control", icon: "lock_person" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-[260px] bg-background border-r border-outline-variant flex flex-col py-6 z-20">
      <div className="px-6 mb-8">
        <h1 className="font-display text-2xl font-bold text-primary flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield_lock
          </span>
          SecureLog
        </h1>
        <p className="font-label-md text-xs text-on-surface-variant mt-1">
          Enterprise Compliance
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto mt-4 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out text-left w-full ${
                isActive
                  ? "text-primary font-bold border-l-4 border-primary bg-secondary-container/20 rounded-r-lg"
                  : "text-on-surface-variant font-body-md text-sm hover:bg-secondary-container/10 hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-auto">
        <div className="flex items-center gap-3 pt-4 border-t border-outline-variant">
          <img
            className="w-10 h-10 rounded-full object-cover border border-outline-variant"
            alt="Marcus Vance"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbpYXMtWorIpPKuD_DOMx0a4YBTBzjFoYIrMt_ZFX5-q1h0QnCmap7E1OCiMQAg7217dBlWoIRDu16F-qSeNHLyYjnKKxGpImKpKnVfAX4hsUbn3SJW0_nhZ_1h5iaS4-nZqUd6q5nDx6L4f3DosCB-IYZySw--n7bl30ZO84nMcVaPKbie0RIVXjLStvM-P-NadmyP-f35itNfMdFmKjNKvgwzDyn2S1-c_AwVlYZrZmCVkOMX6LdlUDZnl5akafCZbTwsYgLqNWe"
          />
          <div>
            <p className="font-body-md text-sm text-on-surface font-semibold">
              Marcus Vance
            </p>
            <p className="font-label-md text-xs text-on-surface-variant">
              Compliance Manager
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
