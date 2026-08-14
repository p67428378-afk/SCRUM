import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import LoginPage from "./pages/LoginPage";
import TaskModal from "./components/tasks/TaskModal";
import { getMeApi, createTaskApi } from "./services/api";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await getMeApi();
      setUser(userData);
    } catch (e) {
      console.error("Failed to fetch user profile", e);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [token]);

  const handleAuthSuccess = (data) => {
    if (data.access_token) {
      setToken(data.access_token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const handleHeaderCreateTask = async (taskData) => {
    await createTaskApi(taskData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading TaskFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!token ? (
        <Routes>
          <Route
            path="/login"
            element={<LoginPage onAuthSuccess={handleAuthSuccess} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="flex min-h-screen bg-slate-900 text-slate-100">
          <Sidebar user={user} onLogout={handleLogout} />
          <div className="flex-1 flex flex-col min-w-0">
            <Header
              user={user}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onNewTask={() => setIsHeaderModalOpen(true)}
            />
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
              <Routes>
                <Route
                  path="/"
                  element={<DashboardPage searchQuery={searchQuery} />}
                />
                <Route
                  path="/tasks"
                  element={<TasksPage searchQuery={searchQuery} />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          <TaskModal
            isOpen={isHeaderModalOpen}
            onClose={() => setIsHeaderModalOpen(false)}
            onSave={handleHeaderCreateTask}
          />
        </div>
      )}
    </BrowserRouter>
  );
}
