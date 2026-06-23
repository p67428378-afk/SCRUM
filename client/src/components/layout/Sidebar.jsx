import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ student, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
      path: "/dashboard",
    },
    {
      id: "profile",
      label: "Profile Settings",
      icon: "person_outline",
      path: "/profile",
    },
    { id: "academics", label: "Academics", icon: "school", path: "#" },
    { id: "settings", label: "Settings", icon: "settings", path: "#" },
  ];

  const displayName = student
    ? student.preferred_name || `${student.first_name} ${student.last_name}`
    : "Alex Rivera";

  const avatarUrl =
    student?.profile_picture_url ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAV5FWdIA3U8E8_tzvGOXCF3l6r59DMSTH-GiPr8rD3H2pd099xBqK2YRCTFIpHn7YlJxR6j4Cun-fTwQWSlvgyKJYxSEQQDfDeH9qnDIVgQj-E9VW6pDD_CBWYDP2n33TCiQDun5_TPtS_gak5nYYVPTPZshaIRBB1LzGmUTYy1fyTR647613aHwBaa6m-aKsPoj3H5wwagFBiHcpjyK-S2g5gzZouiOC_xG3soqa_idrz6UPwguzWdSxDBKqOSWcp_AbITXzN-pCP";

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-container border-r border-outline-variant flex flex-col z-40">
      <div className="flex flex-col h-full p-4 gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <span
            className="material-symbols-outlined text-primary text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield
          </span>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Apex University
            </h1>
            <p className="font-label-md text-label-md text-on-surface-variant">
              Academic Portal
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => item.path !== "#" && navigate(item.path)}
                className={`flex items-center w-full text-left gap-3 px-4 py-3 rounded-lg border-l-4 transition-all duration-150 ${
                  isActive
                    ? "bg-primary-container text-on-primary-container border-primary scale-[0.98]"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest border-transparent"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer User */}
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant rounded-lg">
            <img
              className="w-8 h-8 rounded-full object-cover border border-outline-variant"
              src={avatarUrl}
              alt={displayName}
            />
            <div className="flex flex-col overflow-hidden">
              <span className="font-label-md text-label-md text-on-surface truncate">
                {displayName}
              </span>
              <span className="font-body-md text-body-md text-[10px] text-on-surface-variant">
                Student
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2 text-error hover:bg-error/10 transition-colors rounded-lg w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
