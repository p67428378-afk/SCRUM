import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Bell } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white border border-[#e3e8f0] border-solid flex items-center justify-between px-[32px] py-[16px] w-full shadow-sm">
      <div className="flex gap-[24px] items-center">
        <Link
          to="/"
          className="font-bold text-[#2663eb] text-[18px] hover:opacity-90"
        >
          FreshStock
        </Link>
        <div className="flex gap-[24px] items-center text-[#707a8c] text-[14px] font-medium">
          <Link to="/" className="hover:text-[#2663eb] transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
      <div className="flex gap-[16px] items-center">
        <span className="text-sm text-[#707a8c] font-medium">
          Role:{" "}
          <span className="text-[#171c29] font-semibold">
            {user?.role || "Guest"}
          </span>
        </span>
        <button className="text-[#707a8c] hover:text-[#2663eb] transition-colors p-1">
          <Bell size={20} />
        </button>
        <div className="bg-[#2663eb] flex items-center justify-center rounded-full size-[32px] text-white font-bold text-[12px]">
          {user?.email ? user.email[0].toUpperCase() : "U"}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-[#707a8c] hover:text-red-600 transition-colors font-medium ml-2"
          title="Sign Out"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
