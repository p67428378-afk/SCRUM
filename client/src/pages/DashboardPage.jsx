import React from "react";
import StatGrid from "../components/dashboard/StatGrid.jsx";
import AnnouncementsFeed from "../components/dashboard/AnnouncementsFeed.jsx";
import VisitorLog from "../components/dashboard/VisitorLog.jsx";
import Button from "../components/common/Button.jsx";

export default function DashboardPage({
  bills = [],
  maintenanceRequests = [],
  bookings = [],
  visitors = [],
  announcements = [],
  discussions = [],
  onAddComment,
  onQuickAction,
}) {
  return (
    <div className="flex flex-col gap-6">
      <StatGrid
        bills={bills}
        maintenanceRequests={maintenanceRequests}
        bookings={bookings}
        visitors={visitors}
        onCardClick={onQuickAction}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <AnnouncementsFeed
            announcements={announcements}
            discussions={discussions}
            onAddComment={onAddComment}
          />
        </div>
        <div className="lg:col-span-4 card-surface p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => onQuickAction("payments")}
              variant="success"
              className="w-full justify-between p-4"
            >
              <span>Pay Dues</span>
              <span className="material-symbols-outlined">payments</span>
            </Button>
            <Button
              onClick={() => onQuickAction("maintenance")}
              variant="outline"
              className="w-full justify-between p-4"
            >
              <span>Submit Maintenance Request</span>
              <span className="material-symbols-outlined">build</span>
            </Button>
            <Button
              onClick={() => onQuickAction("facilities")}
              variant="outline"
              className="w-full justify-between p-4"
            >
              <span>Book Facility</span>
              <span className="material-symbols-outlined">calendar_month</span>
            </Button>
            <Button
              onClick={() => onQuickAction("visitors")}
              variant="outline"
              className="w-full justify-between p-4"
            >
              <span>Pre-approve Visitor</span>
              <span className="material-symbols-outlined">group</span>
            </Button>
          </div>
        </div>
      </div>

      <VisitorLog visitors={visitors} />
    </div>
  );
}
