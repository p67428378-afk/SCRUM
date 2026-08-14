import React from "react";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Bike,
  Check,
  RefreshCw,
} from "lucide-react";

export default function ActiveOrdersTable({
  orders = [],
  onUpdateStatus,
  isLoading = false,
}) {
  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("placed")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full border border-red-200">
          Placed
        </span>
      );
    }
    if (s.includes("confirm")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
          Confirmed
        </span>
      );
    }
    if (s.includes("prep") || s.includes("kitchen")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
          Preparing
        </span>
      );
    }
    if (s.includes("out") || s.includes("dispatch") || s.includes("ready")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
          Out for Delivery
        </span>
      );
    }
    if (s.includes("deliver")) {
      return (
        <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
          Delivered
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded-full border border-gray-200">
        {status}
      </span>
    );
  };

  const getNextStatusAction = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("placed")) {
      return {
        nextStatus: "Confirmed",
        label: "Confirm Order",
        icon: CheckCircle,
        style: "bg-amber-600 hover:bg-amber-700 text-white",
      };
    }
    if (s.includes("confirm")) {
      return {
        nextStatus: "Preparing",
        label: "Start Preparing",
        icon: ChefHat,
        style: "bg-yellow-600 hover:bg-yellow-700 text-white",
      };
    }
    if (s.includes("prep") || s.includes("kitchen")) {
      return {
        nextStatus: "Out for Delivery",
        label: "Dispatch Order",
        icon: Bike,
        style: "bg-blue-600 hover:bg-blue-700 text-white",
      };
    }
    if (s.includes("out") || s.includes("dispatch") || s.includes("ready")) {
      return {
        nextStatus: "Delivered",
        label: "Mark Delivered",
        icon: Check,
        style: "bg-emerald-600 hover:bg-emerald-700 text-white",
      };
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Incoming Orders Queue
          </h3>
          <p className="text-xs text-gray-500">
            Live order processing feed for Bandra Hotel Staff
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Updating queue...</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100/80 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600">
              <th className="py-3.5 px-4">Order #</th>
              <th className="py-3.5 px-4">Items & Details</th>
              <th className="py-3.5 px-4">Delivery Address</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-500 font-medium"
                >
                  No active orders in the queue right now.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const action = getNextStatusAction(order.status);
                const ActionIcon = action?.icon;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-amber-50/30 transition"
                  >
                    <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {order.order_number || `#${order.id.substring(0, 8)}`}
                      <span className="block text-[10px] text-gray-500 font-normal">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-gray-800">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((i, idx) => (
                            <div key={idx} className="truncate">
                              {i.quantity}x {i.menu_item_name || "Item"}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">
                            Items details unavailable
                          </span>
                        )}
                      </div>
                      {order.special_instructions && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-100 mt-1">
                          <strong>Note:</strong> {order.special_instructions}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 text-gray-700 max-w-xs truncate">
                      {order.delivery_address_text || "Address not specified"}
                    </td>

                    <td className="py-4 px-4 font-bold text-amber-900 whitespace-nowrap">
                      $
                      {typeof order.total_amount === "number"
                        ? order.total_amount.toFixed(2)
                        : order.total_amount}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {action ? (
                        <button
                          onClick={() =>
                            onUpdateStatus(order.id, action.nextStatus)
                          }
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 ml-auto transition shadow-sm active:scale-95 ${action.style}`}
                        >
                          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                          <span>{action.label}</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 justify-end">
                          <Check className="w-4 h-4" /> Fulfilled
                        </span>
                      )}
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
