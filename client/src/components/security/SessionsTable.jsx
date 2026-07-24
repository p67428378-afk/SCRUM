import React from "react";
import { Laptop, Smartphone, Globe, Trash2, ShieldAlert } from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";

export const SessionsTable = ({ sessions, onRevoke, isRevoking }) => {
  const getDeviceIcon = (deviceInfo) => {
    const info = deviceInfo.toLowerCase();
    if (
      info.includes("phone") ||
      info.includes("mobile") ||
      info.includes("android") ||
      info.includes("iphone")
    ) {
      return <Smartphone className="w-5 h-5 text-indigo-400" />;
    }
    if (
      info.includes("mac") ||
      info.includes("windows") ||
      info.includes("linux")
    ) {
      return <Laptop className="w-5 h-5 text-indigo-400" />;
    }
    return <Globe className="w-5 h-5 text-indigo-400" />;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-900/50 border border-slate-800 rounded-xl">
        <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-on-surface-variant">No active sessions found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-xl shadow-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-900/50">
            <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Device / Channel
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Last Active
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {sessions.map((session) => (
            <tr
              key={session.id}
              className="hover:bg-slate-700/30 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    {getDeviceIcon(session.device_info)}
                  </div>
                  <div>
                    <div className="font-medium text-on-surface">
                      {session.device_info}
                    </div>
                    <div className="text-xs text-on-surface-variant capitalize">
                      {session.channel}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">
                {session.ip_address}
              </td>
              <td className="px-6 py-4 text-sm text-on-surface-variant">
                {session.location || "Unknown"}
              </td>
              <td className="px-6 py-4 text-sm text-on-surface-variant">
                {formatDate(session.last_active_at)}
              </td>
              <td className="px-6 py-4">
                {session.is_current ? (
                  <Badge variant="success">Current Session</Badge>
                ) : (
                  <Badge variant="neutral">Active</Badge>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {!session.is_current && (
                  <Button
                    variant="danger"
                    className="p-2 rounded-lg hover:bg-red-700/20 border border-red-500/20 text-red-400 hover:text-red-300"
                    onClick={() => onRevoke(session.id)}
                    disabled={isRevoking}
                    title="Revoke Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionsTable;
