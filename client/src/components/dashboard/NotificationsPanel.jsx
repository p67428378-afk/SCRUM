import React from "react";

export default function NotificationsPanel({
  notifications = [],
  onMarkAsRead,
}) {
  return (
    <section className="col-span-12 lg:col-span-4 space-y-6">
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-high/50">
          <h3 className="text-lg font-bold">Recent Notifications</h3>
        </div>
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8 text-sm">
              No new notifications.
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.notification_id}
                onClick={() =>
                  !notification.is_read &&
                  onMarkAsRead &&
                  onMarkAsRead(notification.notification_id)
                }
                className={`flex gap-4 p-3 rounded-lg transition-colors border border-transparent hover:border-outline-variant/30 group cursor-pointer ${
                  notification.is_read
                    ? "bg-transparent opacity-60"
                    : "bg-surface-container-low"
                }`}
              >
                <div
                  className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                    notification.is_read
                      ? "bg-outline-variant/20 text-on-surface-variant"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {notification.is_read ? "drafts" : "mail"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface mb-1 break-words">
                    {notification.message}
                  </p>
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      schedule
                    </span>
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weather/Atmospheric Card */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 rounded-xl border border-primary/20 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-on-surface mb-1">
              Solu-Khumbu
            </h4>
            <p className="text-on-surface-variant text-sm">Base Camp Weather</p>
          </div>
          <div className="text-right">
            <span className="material-symbols-outlined text-primary text-4xl mb-1">
              ac_unit
            </span>
            <p className="text-3xl font-bold">-12°C</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="px-2 py-1 bg-surface/50 rounded-lg text-[10px] text-on-surface-variant uppercase tracking-widest font-bold border border-outline-variant/30">
            Wind: 15km/h
          </span>
          <span className="px-2 py-1 bg-surface/50 rounded-lg text-[10px] text-on-surface-variant uppercase tracking-widest font-bold border border-outline-variant/30">
            Vis: Clear
          </span>
        </div>
      </div>
    </section>
  );
}
