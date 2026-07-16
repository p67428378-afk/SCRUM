import React, { useState, useEffect } from "react";
import { authService, roomService, bookingService } from "./services/api.js";
import AppLayout from "./components/layout/AppLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import RoomsPage from "./pages/RoomsPage.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import { KeyRound, AlertCircle, Loader2 } from "lucide-react";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // App Data State
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login Form State
  const [username, setUsername] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Check for existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = authService.getCurrentUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [roomsData, bookingsData] = await Promise.all([
        roomService.getRooms(),
        bookingService.getBookings(),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (err) {
      setError("Failed to load hotel data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const data = await authService.login(username, password);
      setToken(data.access_token);
      setUser(data.user);
    } catch (err) {
      setLoginError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setRooms([]);
    setBookings([]);
  };

  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      const updatedRoom = await roomService.updateStatus(roomId, newStatus);
      setRooms(rooms.map((r) => (r.id === roomId ? updatedRoom : r)));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update room status.");
    }
  };

  const handleCreateBooking = async (bookingData) => {
    const newBooking = await bookingService.createBooking(bookingData);
    setBookings([...bookings, newBooking]);
    // Refresh rooms to reflect status changes if check-in is today
    const roomsData = await roomService.getRooms();
    setRooms(roomsData);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingService.cancelBooking(bookingId);
        setBookings(
          bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "Cancelled" } : b,
          ),
        );
        // Refresh rooms to reflect status changes
        const roomsData = await roomService.getRooms();
        setRooms(roomsData);
      } catch (err) {
        alert(err.response?.data?.detail || "Failed to cancel booking.");
      }
    }
  };

  // Render Login Screen if not authenticated
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto w-full max-w-md">
          <div className="bg-indigo-600 text-white p-3 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center shadow-md">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Grand Stay Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage rooms and reservations
          </p>
        </div>

        <div className="mt-8 sm:mx-auto w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200">
            <form className="space-y-6" onSubmit={handleLogin}>
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                >
                  {loginLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-gray-100 pt-4 text-center">
              <p className="text-xs text-gray-500">
                Test account:{" "}
                <strong className="text-gray-700">test@example.com</strong> /{" "}
                <strong className="text-gray-700">testpassword</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Main Application
  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={handleLogout}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500 font-medium">
            Loading hotel data...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-3 max-w-2xl mx-auto my-12 shadow-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Error Loading Data</p>
            <p className="mt-0.5">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-xs font-bold underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {activeTab === "dashboard" && (
            <DashboardPage rooms={rooms} bookings={bookings} />
          )}
          {activeTab === "rooms" && (
            <RoomsPage
              rooms={rooms}
              onStatusChange={handleRoomStatusChange}
              userRole={user?.role}
            />
          )}
          {activeTab === "bookings" && (
            <BookingsPage
              bookings={bookings}
              rooms={rooms}
              onCreateBooking={handleCreateBooking}
              onCancelBooking={handleCancelBooking}
            />
          )}
        </>
      )}
    </AppLayout>
  );
}
