import React from "react";
import {
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  ChefHat,
  Truck,
  Package,
} from "lucide-react";

export default function OrderTable({ orders, onStatusChange, userRole }) {
  const statuses = [
    "Placed",
    "In the Kitchen",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Placed":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "In the Kitchen":
        return <ChefHat className="h-4 w-4 text-amber-500" />;
      case "Out for Delivery":
        return <Truck className="h-4 w-4 text-indigo-500" />;
      case "Delivered":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Placed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "In the Kitchen":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Out for Delivery":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500 font-medium">No food orders placed yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Order ID / Date</th>
              <th className="px-6 py-4">Restaurant</th>
              <th className="px-6 py-4">Room / Guest</th>
              <th className="px-6 py-4">Items Ordered</th>
              <th className="px-6 py-4">Total Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-gray-900">
                    #{order.id.substring(0, 8)}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {order.restaurant?.name || "Partner Restaurant"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.booking ? (
                    <>
                      <div className="font-medium text-gray-900 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                        Room {order.booking.room?.room_number || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {order.booking.guest_name}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">
                      Walk-in / Guest
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1 max-w-xs">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="text-xs text-gray-700 flex justify-between"
                      >
                        <span className="truncate font-medium">
                          {item.menu_item?.name || "Menu Item"}
                        </span>
                        <span className="text-gray-500 ml-2">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                    {order.notes && (
                      <div className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 mt-1.5 flex items-start gap-1">
                        <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                  ${parseFloat(order.total_price).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                  {userRole === "Administrator" || userRole === "Manager" ? (
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-400 italic">View Only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
