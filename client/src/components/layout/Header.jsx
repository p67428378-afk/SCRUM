import React from "react";
import { useLocation } from "react-router-dom";

export default function Header({ student }) {
  const location = useLocation();

  const getBreadcrumb = () => {
    if (location.pathname === "/profile") {
      return "Student Portal / Profile Settings";
    }
    return "Student Portal / Dashboard";
  };

  const avatarUrl =
    student?.profile_picture_url ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAlPRBgd6WbiOysEN0is5RUE0iUuN_a9j9pZlo2GsDokBpKJZTANTeNq9R_Xrm2Mchqwr9LsRagr1RskEDn0LeylHTM3Kryk4l268nUdb_uTSmDyl1_9ZimvQZaLUi3aAuk04HVnNzOL0uX8Z0b_t-2CWrbD6RW6_15CrVxO845g3546GlvAbkB02M5QCoxmRb2zgrN8POq4JAeFddgZhsjFljAwFHpifUi9khSo87VQnzl__KM6Px1fX09XqfW8kFyOGgtHmP770vJ";

  return (
    <header className="fixed top-0 right-0 h-[64px] w-[calc(100%-260px)] bg-surface-dim border-b border-outline-variant z-30">
      <div className="flex justify-between items-center px-6 h-full ml-0">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          <span className="font-label-md text-label-md font-semibold text-on-surface-variant">
            {getBreadcrumb()}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              className="bg-surface-container-high border border-outline-variant text-on-surface font-body-md rounded-full py-1.5 pl-9 pr-4 w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50"
              placeholder="Search courses, assignments..."
              type="text"
            />
          </div>

          {/* Notifications */}
          <button className="relative text-on-surface-variant hover:text-primary transition-colors opacity-100 hover:opacity-80">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-on-error">
              2
            </span>
          </button>

          {/* Profile */}
          <button className="flex items-center hover:opacity-80 transition-opacity">
            <img
              className="w-8 h-8 rounded-full border border-outline-variant object-cover"
              src={avatarUrl}
              alt="Student Avatar"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
