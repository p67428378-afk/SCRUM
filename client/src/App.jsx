import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";

export const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard onNavigate={setActiveTab} />;
      case "users":
        return <UserManagement />;
      case "roles":
        return (
          <div className="bg-white p-6 rounded-xl border border-[#dee2e6] card-shadow">
            <h2 className="text-headline-md font-bold mb-4">
              Roles Management
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Roles management interface is coming soon.
            </p>
          </div>
        );
      case "permissions":
        return (
          <div className="bg-white p-6 rounded-xl border border-[#dee2e6] card-shadow">
            <h2 className="text-headline-md font-bold mb-4">
              Permissions Management
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Permissions management interface is coming soon.
            </p>
          </div>
        );
      case "audit-logs":
        return (
          <div className="bg-white p-6 rounded-xl border border-[#dee2e6] card-shadow">
            <h2 className="text-headline-md font-bold mb-4">Audit Logs</h2>
            <p className="text-body-md text-on-surface-variant">
              Audit logs interface is coming soon.
            </p>
          </div>
        );
      default:
        return <AdminDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* TopNavBar (Fixed Header) */}
      <header className="bg-primary-container h-[64px] w-full sticky top-0 z-50 flex items-center justify-between px-margin-desktop border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-headline-sm font-bold text-white">
            Enterprise Admin
          </span>
          <div className="h-6 w-px bg-white/20 ml-2"></div>
          <h1 className="text-white font-headline-sm font-bold ml-2">
            Secure Employee Account Management
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer text-white hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined">notifications</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl74ShOYw6k4Ox-LcQJKH5Vsi6vzTvfVicZQUdHC0dzHlM35ciopBxSNeVEG3nDYF_lZCShli_apcjoqh6_Erwbgfp5raWu-iLRn62DgmNmOu2TU_0qSZMSKl44jsAzFWhhK_nOIdlgfDOg1S2-8EKYpF6eBWP7NHP3Uav7o4LcN_siqV-w_kfvU6XcW70pniTdFhlIIoh9k_TJ_3f-cq8UKlnldYkTgk3_L2-a-fKx1bFO2H9UehvaQD4iit-myp5N0VXDX_jeL2V"
              />
            </div>
            <span className="text-white font-label-md">System Admin</span>
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-1 rounded-lg text-label-md font-bold transition-all border border-white/30 active:opacity-80">
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* SideNavBar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Workspace */}
        <main className="flex-grow p-margin-desktop bg-[#f8f9fa] overflow-y-auto">
          <div className="max-w-[container-max-width] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
