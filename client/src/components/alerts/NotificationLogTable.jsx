import React from "react";
import { AlertCircle, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export default function NotificationLogTable({ notifications = [] }) {
  return (
    <div className="bg-[#171F33] rounded-xl border border-[#3C494E] shadow-xl overflow-hidden">
      <div className="p-4 border-b border-[#3C494E] flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" /> Triggered Alert
            Notification Logs
          </h3>
          <p className="text-xs text-[#BBC9CF] font-mono mt-0.5">
            Audit history of automated weather alerts dispatched to analyst
            subscribers
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#222A3D] text-[#BBC9CF] font-mono border-b border-[#3C494E]">
            <tr>
              <th className="p-4">DISPATCHED AT</th>
              <th className="p-4">TRIGGERED VALUE</th>
              <th className="p-4">MESSAGE / ALERT SUMMARY</th>
              <th className="p-4">DISPATCH STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3C494E]/50">
            {notifications.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-[#BBC9CF]">
                  No alert notifications recorded yet. Notifications will appear
                  here when weather conditions exceed configured threshold
                  rules.
                </td>
              </tr>
            ) : (
              notifications.map((notif) => {
                const dateStr = notif.dispatched_at
                  ? new Date(notif.dispatched_at).toLocaleString()
                  : new Date().toLocaleString();

                return (
                  <tr
                    key={notif.id}
                    className="hover:bg-[#222A3D]/40 transition"
                  >
                    <td className="p-4 font-mono text-[#BBC9CF] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00D1FF]" />
                      {dateStr}
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {notif.triggered_value}
                    </td>
                    <td className="p-4 font-mono text-[#DAE2FD]">
                      {notif.message}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> DISPATCHED
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
