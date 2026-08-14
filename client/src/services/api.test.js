import { describe, it, expect, vi, beforeEach } from "vitest";
import * as apiServices from "./api";

describe("API Services Module", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exports all expected authentication API service functions", () => {
    expect(typeof apiServices.registerUser).toBe("function");
    expect(typeof apiServices.loginUser).toBe("function");
    expect(typeof apiServices.logoutUser).toBe("function");
    expect(typeof apiServices.getCurrentUser).toBe("function");
    expect(typeof apiServices.getAddresses).toBe("function");
  });

  it("exports all expected menu API service functions", () => {
    expect(typeof apiServices.getCategories).toBe("function");
    expect(typeof apiServices.getMenuItems).toBe("function");
    expect(typeof apiServices.createMenuItem).toBe("function");
    expect(typeof apiServices.updateMenuItem).toBe("function");
  });

  it("exports all expected order API service functions", () => {
    expect(typeof apiServices.placeOrder).toBe("function");
    expect(typeof apiServices.getMyOrders).toBe("function");
    expect(typeof apiServices.getOrderById).toBe("function");
    expect(typeof apiServices.getStaffDashboard).toBe("function");
    expect(typeof apiServices.updateOrderStatus).toBe("function");
  });

  it("clears token on logout", () => {
    localStorage.setItem("token", "mock-jwt-token");
    apiServices.logoutUser();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
