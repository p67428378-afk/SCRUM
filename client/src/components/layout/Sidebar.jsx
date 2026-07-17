import React from "react";
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  Settings,
  User,
} from "lucide-react";

export default function Sidebar() {
  return (
    <nav className="hidden md:flex w-[260px] h-screen flex-col border-r border-outline-variant bg-surface-container fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-lg flex items-center gap-sm border-b border-outline-variant">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
          T
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
            TaskFlow
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Productivity Suite
          </p>
        </div>
      </div>
      {/* Navigation Links */}
      <div className="flex-1 py-md overflow-y-auto">
        <ul className="space-y-sm px-sm">
          {/* Active: Dashboard */}
          <li>
            <a
              className="flex items-center gap-md px-md py-sm rounded-lg text-primary font-bold border-l-2 border-primary bg-primary/10 scale-95 transition-transform hover:bg-surface-container-high duration-200"
              href="#"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-label-md text-label-md">Dashboard</span>
            </a>
          </li>
          {/* Inactive */}
          <li>
            <a
              className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface font-medium scale-95 transition-transform hover:bg-surface-container-high duration-200"
              href="#"
            >
              <ClipboardList className="w-5 h-5" />
              <span className="font-label-md text-label-md">Active Tasks</span>
            </a>
          </li>
          <li>
            <a
              className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface font-medium scale-95 transition-transform hover:bg-surface-container-high duration-200"
              href="#"
            >
              <CheckSquare className="w-5 h-5" />
              <span className="font-label-md text-label-md">Completed</span>
            </a>
          </li>
          <li>
            <a
              className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface font-medium scale-95 transition-transform hover:bg-surface-container-high duration-200"
              href="#"
            >
              <Settings className="w-5 h-5" />
              <span className="font-label-md text-label-md">Settings</span>
            </a>
          </li>
        </ul>
      </div>
      {/* Footer Profile */}
      <div className="p-md border-t border-outline-variant">
        <a
          className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-high transition-colors duration-200"
          href="#"
        >
          <User className="w-5 h-5 text-on-surface-variant" />
          <div>
            <p className="font-label-md text-label-md text-on-surface font-semibold">
              Sarah Chen
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Productivity Master
            </p>
          </div>
        </a>
      </div>
    </nav>
  );
}
