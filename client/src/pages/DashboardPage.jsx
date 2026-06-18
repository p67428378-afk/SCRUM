import React, { useState, useEffect } from "react";
import KPIGrid from "../components/dashboard/KPIGrid";
import BookingsTable from "../components/dashboard/BookingsTable";
import NotificationsPanel from "../components/dashboard/NotificationsPanel";
import Header from "../components/layout/Header";
import {
  bookingsService,
  notificationsService,
  availabilityService,
} from "../services/api";

export default function DashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, notificationsData, availabilityData] =
          await Promise.all([
            bookingsService.getBookings(),
            notificationsService.getNotifications(),
            availabilityService.getAvailability(),
          ]);
        setBookings(bookingsData);
        setNotifications(notificationsData);
        setAvailability(availabilityData);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.trek_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "Confirmed",
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const unavailableDays = availability.filter((a) => !a.is_available).length;
  const unreadNotificationsCount = notifications.filter(
    (n) => !n.is_read,
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        onSearch={setSearchQuery}
        unreadCount={unreadNotificationsCount}
      />

      <div className="pt-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-on-surface mb-2">
            Dashboard Overview
          </h2>
          <p className="text-on-surface-variant text-sm">
            Welcome back, Chief Guide. Here's what's happening today.
          </p>
        </div>

        <KPIGrid
          total={totalBookings}
          confirmed={confirmedBookings}
          pending={pendingBookings}
          unavailable={unavailableDays}
        />

        <div className="grid grid-cols-12 gap-6 items-start">
          <BookingsTable bookings={filteredBookings} />
          <NotificationsPanel
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      </div>
    </div>
  );
}
