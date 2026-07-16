import React from "react";
import {
  BedDouble,
  CalendarDays,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function DashboardPage({ rooms, bookings }) {
  // Calculate metrics
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
  const dirtyRooms = rooms.filter((r) => r.status === "Dirty").length;
  const availableRooms = rooms.filter((r) => r.status === "Available").length;

  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const activeBookings = bookings.filter((b) => b.status !== "Cancelled");
  const totalRevenue = activeBookings.reduce(
    (sum, b) => sum + (b.total_amount || 0),
    0,
  );

  // Get upcoming check-ins (today or future)
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingCheckIns = activeBookings
    .filter((b) => b.check_in_date >= todayStr)
    .sort((a, b) => a.check_in_date.localeCompare(b.check_in_date))
    .slice(0, 5);

  const stats = [
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Available Rooms",
      value: availableRooms,
      icon: BedDouble,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Dirty Rooms",
      value: dirtyRooms,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time metrics and upcoming activities for Grand Stay Hotel.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4"
            >
              <div className={`${stat.bg} p-3.5 rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Check-ins */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4 border-b border-gray-100 pb-3">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900">Upcoming Check-ins</h3>
            </div>

            {upcomingCheckIns.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {upcomingCheckIns.map((booking) => {
                  const room = rooms.find((r) => r.id === booking.room_id);
                  return (
                    <div
                      key={booking.id}
                      className="py-3.5 flex justify-between items-center hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-bold text-gray-900">
                          {booking.guest_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Room {room ? room.room_number : "Unknown"} (
                          {room ? room.type : "N/A"})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100">
                          {booking.check_in_date}
                        </span>
                        <p className="text-xs font-bold text-gray-900 mt-1">
                          ${booking.total_amount}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="font-medium">No upcoming check-ins scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Room Status Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4 border-b border-gray-100 pb-3">
              <BedDouble className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900">Room Status Summary</h3>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></span>
                    Available
                  </span>
                  <span>
                    {availableRooms} / {totalRooms}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{
                      width: `${totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></span>
                    Occupied
                  </span>
                  <span>
                    {occupiedRooms} / {totalRooms}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2"></span>
                    Dirty
                  </span>
                  <span>
                    {dirtyRooms} / {totalRooms}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full"
                    style={{
                      width: `${totalRooms > 0 ? (dirtyRooms / totalRooms) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
