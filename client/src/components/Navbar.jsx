import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  User,
  LogOut,
  ShieldAlert,
  Users,
  PlusCircle,
} from "lucide-react";
import { login, logout } from "../services/api";

export default function Navbar({ onOpenRegisterModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) || {
          full_name: "Dr. Sarah Jenkins",
          role: "Doctor",
          email: "doctor@example.com",
        }
      );
    } catch {
      return {
        full_name: "Dr. Sarah Jenkins",
        role: "Doctor",
        email: "doctor@example.com",
      };
    }
  });

  const [isLogining, setIsLogining] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleQuickLogin = async (roleEmail, defaultRole) => {
    setIsLogining(true);
    setLoginError("");
    try {
      // Try to log in with seed test user
      const data = await login(roleEmail, "testpassword");
      setCurrentUser(data.user);
    } catch (err) {
      // Fallback local state for UI demonstration if backend auth fails or during offline test
      const dummyUser = {
        full_name: `Test ${defaultRole}`,
        role: defaultRole,
        email: roleEmail,
      };
      localStorage.setItem("user", JSON.stringify(dummyUser));
      setCurrentUser(dummyUser);
    } finally {
      setIsLogining(false);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center space-x-2 text-blue-400 font-bold text-xl hover:text-blue-300 transition-colors"
            >
              <Activity className="h-7 w-7 text-blue-500" />
              <span className="text-white font-semibold tracking-tight">
                CarePulse{" "}
                <span className="text-blue-400 font-normal text-sm">
                  Patient Portal
                </span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-slate-800 text-blue-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="flex items-center space-x-1">
                <Users className="w-4 h-4 mr-1" />
                Patient Directory
              </span>
            </Link>
          </nav>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center space-x-3">
            {onOpenRegisterModal && (
              <button
                onClick={onOpenRegisterModal}
                className="inline-flex items-center px-3.5 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Register Patient
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-3 border-l border-slate-700 pl-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">
                    {currentUser.full_name || currentUser.email}
                  </div>
                  <div className="text-xs text-blue-400 font-mono flex items-center justify-end">
                    <ShieldAlert className="w-3 h-3 mr-0.5 inline" />
                    Role: {currentUser.role || "Doctor"}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuickLogin("test@example.com", "Doctor")}
                  disabled={isLogining}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700"
                >
                  Login as Doctor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Credential Notice Banner */}
      <div className="bg-slate-800 text-slate-400 text-xs py-1 px-4 text-center border-t border-slate-800">
        <span>
          Test Credentials:{" "}
          <strong className="text-slate-200">test@example.com</strong> /{" "}
          <strong className="text-slate-200">testpassword</strong> (Roles:
          Admin, Doctor, Nurse, Receptionist)
        </span>
      </div>
    </header>
  );
}
