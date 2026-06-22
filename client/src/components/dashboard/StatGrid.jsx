import React from "react";

export default function StatGrid({
  bills = [],
  maintenanceRequests = [],
  bookings = [],
  visitors = [],
  onCardClick,
}) {
  const unpaidBills = bills.filter((b) => b.status?.toLowerCase() === "unpaid");
  const totalDues = unpaidBills.reduce(
    (sum, b) => sum + parseFloat(b.amount || 0),
    0,
  );

  const pendingRequests = maintenanceRequests.filter(
    (r) => r.status?.toLowerCase() === "pending",
  );
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.start_time) >= new Date(),
  );
  const expectedVisitors = visitors.filter(
    (v) => v.status?.toLowerCase() === "expected",
  );

  const stats = [
    {
      id: "payments",
      title: "Outstanding Dues",
      value: `$${totalDues.toFixed(2)}`,
      subtext: unpaidBills.length > 0 ? `due in 5 days` : "No outstanding dues",
      icon: "account_balance_wallet",
    },
    {
      id: "maintenance",
      title: "Active Maint. Requests",
      value: `${pendingRequests.length} Pending`,
      subtext: `${maintenanceRequests.length - pendingRequests.length} resolved`,
      icon: "build",
    },
    {
      id: "facilities",
      title: "Booked Facilities",
      value: `${upcomingBookings.length} Upcoming`,
      subtext:
        upcomingBookings.length > 0
          ? "Next booking scheduled"
          : "No upcoming bookings",
      icon: "calendar_month",
    },
    {
      id: "visitors",
      title: "Pre-approved Visitors",
      value: `${expectedVisitors.length} Today`,
      subtext: "Expected arrivals",
      icon: "group",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          onClick={() => onCardClick(stat.id)}
          className="card-surface p-6 flex flex-col gap-2 hover:border-[#6366F1] transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {stat.title}
            </span>
            <span className="material-symbols-outlined text-[#6366F1] opacity-80 group-hover:opacity-100 transition-opacity">
              {stat.icon}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-200 block">
              {stat.value}
            </span>
            <span className="text-sm text-slate-400 mt-1 block">
              {stat.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
