import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Default Mock Data for offline / fallback rendering
const MOCK_MENU = [
  {
    id: "m1",
    name: "Iced Latte",
    category: "Beverages",
    price: 4.5,
    description: "Espresso with chilled milk over ice",
    is_available: true,
  },
  {
    id: "m2",
    name: "Cappuccino",
    category: "Beverages",
    price: 4.0,
    description: "Rich espresso topped with velvety steamed milk foam",
    is_available: true,
  },
  {
    id: "m3",
    name: "Avocado Toast",
    category: "Food",
    price: 8.5,
    description:
      "Artisan sourdough with mashed avocado, chili flakes & sea salt",
    is_available: true,
  },
  {
    id: "m4",
    name: "Club Sandwich",
    category: "Food",
    price: 10.0,
    description: "Triple-decker with smoked turkey, bacon, lettuce & tomato",
    is_available: false,
  },
  {
    id: "m5",
    name: "Blueberry Muffin",
    category: "Desserts",
    price: 3.5,
    description: "Freshly baked muffin bursting with blueberries",
    is_available: true,
  },
  {
    id: "m6",
    name: "Cheesecake Slice",
    category: "Desserts",
    price: 5.5,
    description: "Classic New York style creamy cheesecake",
    is_available: true,
  },
];

const MOCK_TABLES = [
  { id: "t1", table_number: 1, capacity: 2, status: "Available" },
  { id: "t2", table_number: 2, capacity: 2, status: "Occupied" },
  { id: "t3", table_number: 3, capacity: 4, status: "Available" },
  { id: "t4", table_number: 4, capacity: 4, status: "Reserved" },
  { id: "t5", table_number: 5, capacity: 6, status: "Reserved" },
  { id: "t6", table_number: 6, capacity: 6, status: "Available" },
  { id: "t7", table_number: 7, capacity: 8, status: "Occupied" },
  { id: "t8", table_number: 8, capacity: 4, status: "Available" },
];

const MOCK_ORDERS = [
  {
    id: "o101",
    order_number: "#101",
    table_id: "t2",
    table_number: 2,
    items: [
      {
        id: "oi1",
        menu_item_id: "m1",
        name: "Iced Latte",
        quantity: 2,
        unit_price: 4.5,
        subtotal: 9.0,
      },
      {
        id: "oi2",
        menu_item_id: "m5",
        name: "Blueberry Muffin",
        quantity: 1,
        unit_price: 3.5,
        subtotal: 3.5,
      },
    ],
    subtotal: 12.5,
    tax: 1.0,
    total_price: 13.5,
    status: "Preparing",
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "o102",
    order_number: "#102",
    table_id: "t7",
    table_number: 7,
    items: [
      {
        id: "oi3",
        menu_item_id: "m3",
        name: "Avocado Toast",
        quantity: 2,
        unit_price: 8.5,
        subtotal: 17.0,
      },
      {
        id: "oi4",
        menu_item_id: "m2",
        name: "Cappuccino",
        quantity: 2,
        unit_price: 4.0,
        subtotal: 8.0,
      },
    ],
    subtotal: 25.0,
    tax: 2.0,
    total_price: 27.0,
    status: "Pending",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "o103",
    order_number: "#103",
    table_id: "t1",
    table_number: 1,
    items: [
      {
        id: "oi5",
        menu_item_id: "m6",
        name: "Cheesecake Slice",
        quantity: 1,
        unit_price: 5.5,
        subtotal: 5.5,
      },
    ],
    subtotal: 5.5,
    tax: 0.44,
    total_price: 5.94,
    status: "Ready",
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
  },
];

const MOCK_RESERVATIONS = [
  {
    id: "r1",
    table_id: "t5",
    table_number: 5,
    customer_name: "John Doe",
    party_size: 4,
    reservation_time: "2026-09-03T18:00",
    notes: "Anniversary dinner celebration",
  },
];

// Local state holders for fallback mode
let localMenu = [...MOCK_MENU];
let localTables = [...MOCK_TABLES];
let localOrders = [...MOCK_ORDERS];
let localReservations = [...MOCK_RESERVATIONS];

// --- Menu API ---
export async function getMenuItems(category) {
  try {
    const response = await apiClient.get("/api/v1/menu", {
      params: { category },
    });
    return response.data;
  } catch (err) {
    console.warn(
      "API /api/v1/menu fetch failed, returning local state:",
      err.message,
    );
    if (category && category !== "All") {
      return localMenu.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase(),
      );
    }
    return localMenu;
  }
}

export async function createMenuItem(itemData) {
  try {
    const response = await apiClient.post("/api/v1/menu", itemData);
    return response.data;
  } catch (err) {
    console.warn(
      "API POST /api/v1/menu failed, saving to local fallback:",
      err.message,
    );
    const newItem = {
      id: "m_" + Date.now(),
      name: itemData.name,
      category: itemData.category || "Beverages",
      price: parseFloat(itemData.price) || 0,
      description: itemData.description || "",
      is_available:
        itemData.is_available !== undefined ? itemData.is_available : true,
    };
    localMenu.push(newItem);
    return newItem;
  }
}

export async function updateMenuItem(id, itemData) {
  try {
    const response = await apiClient.put(`/api/v1/menu/${id}`, itemData);
    return response.data;
  } catch (err) {
    console.warn(
      `API PUT /api/v1/menu/${id} failed, updating local fallback:`,
      err.message,
    );
    const index = localMenu.findIndex((item) => item.id === id);
    if (index !== -1) {
      localMenu[index] = { ...localMenu[index], ...itemData };
      return localMenu[index];
    }
    throw err;
  }
}

export async function deleteMenuItem(id) {
  try {
    const response = await apiClient.delete(`/api/v1/menu/${id}`);
    return response.data;
  } catch (err) {
    console.warn(
      `API DELETE /api/v1/menu/${id} failed, deleting from local fallback:`,
      err.message,
    );
    localMenu = localMenu.filter((item) => item.id !== id);
    return { success: true };
  }
}

// --- Orders API ---
export async function getOrders() {
  try {
    const response = await apiClient.get("/api/v1/orders");
    return response.data;
  } catch (err) {
    console.warn(
      "API GET /api/v1/orders failed, returning local state:",
      err.message,
    );
    return localOrders;
  }
}

export async function createOrder(orderPayload) {
  try {
    const response = await apiClient.post("/api/v1/orders", orderPayload);
    return response.data;
  } catch (err) {
    console.warn(
      "API POST /api/v1/orders failed, creating in local fallback:",
      err.message,
    );
    const subtotal = (orderPayload.items || []).reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total_price = Math.round((subtotal + tax) * 100) / 100;

    const newOrder = {
      id: "o_" + Date.now(),
      order_number: "#" + (100 + localOrders.length + 1),
      table_id: orderPayload.table_id || "t1",
      table_number: orderPayload.table_number || 1,
      items: orderPayload.items || [],
      subtotal,
      tax,
      total_price,
      status: "Pending",
      created_at: new Date().toISOString(),
    };
    localOrders.unshift(newOrder);
    return newOrder;
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const response = await apiClient.patch(`/api/v1/orders/${id}/status`, {
      status,
    });
    return response.data;
  } catch (err) {
    console.warn(
      `API PATCH /api/v1/orders/${id}/status failed, updating local fallback:`,
      err.message,
    );
    const index = localOrders.findIndex((o) => o.id === id);
    if (index !== -1) {
      localOrders[index].status = status;
      return localOrders[index];
    }
    throw err;
  }
}

// --- Tables API ---
export async function getTables() {
  try {
    const response = await apiClient.get("/api/v1/tables");
    return response.data;
  } catch (err) {
    console.warn(
      "API GET /api/v1/tables failed, returning local state:",
      err.message,
    );
    return localTables;
  }
}

export async function createReservation(reservationPayload) {
  try {
    const response = await apiClient.post(
      "/api/v1/tables/reservations",
      reservationPayload,
    );
    return response.data;
  } catch (err) {
    console.warn(
      "API POST /api/v1/tables/reservations failed, updating local fallback:",
      err.message,
    );

    // Check double booking in local state
    const existing = localReservations.find(
      (r) =>
        r.table_id === reservationPayload.table_id &&
        r.reservation_time === reservationPayload.reservation_time,
    );
    if (existing) {
      throw new Error(
        `Table ${reservationPayload.table_number || ""} is already reserved for this time slot.`,
      );
    }

    const newRes = {
      id: "r_" + Date.now(),
      ...reservationPayload,
    };
    localReservations.push(newRes);

    // Update table status
    const tIndex = localTables.findIndex(
      (t) => t.id === reservationPayload.table_id,
    );
    if (tIndex !== -1) {
      localTables[tIndex].status = "Reserved";
    }

    return newRes;
  }
}

// --- Dashboard API ---
export async function getDashboardSummary() {
  try {
    const response = await apiClient.get("/api/v1/dashboard");
    return response.data;
  } catch (err) {
    console.warn(
      "API GET /api/v1/dashboard failed, calculating from local state:",
      err.message,
    );
    const completedOrders = localOrders.filter((o) => o.status === "Completed");
    const todayRevenue = completedOrders.reduce(
      (sum, o) => sum + (o.total_price || 0),
      1250.0,
    );
    const activeOrdersCount = localOrders.filter(
      (o) => o.status !== "Completed" && o.status !== "Cancelled",
    ).length;
    const occupiedCount = localTables.filter(
      (t) => t.status === "Occupied" || t.status === "Reserved",
    ).length;

    return {
      daily_sales: todayRevenue,
      completed_orders_count: completedOrders.length + 85,
      active_orders_count: activeOrdersCount,
      total_tables: localTables.length,
      occupied_tables: occupiedCount,
      occupancy_rate: Math.round((occupiedCount / localTables.length) * 100),
      top_items: [
        { name: "Iced Latte", sales_count: 42, revenue: 189.0 },
        { name: "Avocado Toast", sales_count: 28, revenue: 238.0 },
        { name: "Cappuccino", sales_count: 25, revenue: 100.0 },
        { name: "Blueberry Muffin", sales_count: 19, revenue: 66.5 },
      ],
    };
  }
}
