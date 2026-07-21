import React from "react";
import {
  LogOut,
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  User,
  Utensils,
  Receipt,
} from "lucide-react";

export default function AppLayout({
  children,
  activeTab,
  setActiveTab,
  user,
  onLogout,
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "rooms", label: "Rooms", icon: BedDouble },
    { id: "bookings", label: "Bookings", icon: CalendarDays },
    { id: "restaurants", label: "Restaurants", icon: Utensils },
    { id: "orders", label: "Orders", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <BedDouble className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Grand Stay Portal
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {user?.username}
            </span>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
              {user?.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 space-y-2 hidden md:block">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-4">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400"}`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Mobile Navigation Bar */}
          <div className="md:hidden flex space-x-2 mb-6 bg-white p-2 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 py-2 px-3 text-center text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
