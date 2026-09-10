import { describe, it, expect } from "vitest";
import { getServices, getStaff, getAppointments, getCustomers } from "./api";

describe("API Service Functions", () => {
  it("exports all expected service API functions", () => {
    expect(typeof getServices).toBe("function");
    expect(typeof getStaff).toBe("function");
    expect(typeof getAppointments).toBe("function");
    expect(typeof getCustomers).toBe("function");
  });
});
