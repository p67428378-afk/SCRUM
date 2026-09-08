import React, { useState, useEffect } from "react";
import { Bell, Plus, ShieldCheck } from "lucide-react";
import AnnouncementFeed from "../components/announcements/AnnouncementFeed.jsx";
import AnnouncementPublisherForm from "../components/announcements/AnnouncementPublisherForm.jsx";
import {
  getAnnouncements,
  createAnnouncement,
  archiveAnnouncement,
} from "../services/api.js";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncementFeed = async () => {
    try {
      const data = await getAnnouncements();
      if (Array.isArray(data) && data.length > 0) {
        setAnnouncements(data);
      } else {
        setAnnouncements([
          {
            id: "ann-1",
            title: "Water Main Shutoff Scheduled",
            content:
              "Water main maintenance scheduled for tomorrow 9 AM - 2 PM. Please store emergency water for household usage.",
            urgency: "Emergency",
            created_at: new Date().toISOString(),
            is_archived: false,
          },
          {
            id: "ann-2",
            title: "Speed Limit Enforced on Maple Drive",
            content:
              "Please adhere to the 15 mph speed limit within village residential streets. Security radar patrols active.",
            urgency: "Warning",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            is_archived: false,
          },
          {
            id: "ann-3",
            title: "Annual Village Townhall Meeting",
            content:
              "Join us at the Community Hall this Saturday at 10 AM for quarterly budget updates, security reports, and community Q&A.",
            urgency: "Info",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            is_archived: false,
          },
        ]);
      }
    } catch (err) {
      console.warn("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncementFeed();
  }, []);

  const handlePublishAnnouncement = async (payload) => {
    const res = await createAnnouncement(payload);
    await fetchAnnouncementFeed();
    return res;
  };

  const handleArchiveAnnouncement = async (id) => {
    try {
      await archiveAnnouncement(id);
      await fetchAnnouncementFeed();
    } catch (err) {
      console.error("Failed to archive announcement:", err);
      // Fallback optimistic update
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_archived: true } : a)),
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Village Bulletin &
            Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast village notices categorized by urgency (Emergency,
            Warning, Info) and view active bulletin feeds.
          </p>
        </div>
      </div>

      {/* Main Layout: Feed & Admin Publisher Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Active Notice Feed
          </h2>
          <AnnouncementFeed
            announcements={announcements}
            onArchive={handleArchiveAnnouncement}
          />
        </div>

        <div>
          <AnnouncementPublisherForm
            onPublishSuccess={handlePublishAnnouncement}
          />
        </div>
      </div>
    </div>
  );
}
