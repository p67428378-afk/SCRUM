import { describe, it, expect } from "vitest";
import * as api from "./api.js";

describe("API Service Layer", () => {
  it("exports required authentication functions", () => {
    expect(typeof api.loginUser).toBe("function");
    expect(typeof api.registerUser).toBe("function");
    expect(typeof api.getCurrentUser).toBe("function");
  });

  it("exports required resident directory functions", () => {
    expect(typeof api.getResidents).toBe("function");
    expect(typeof api.updateResident).toBe("function");
  });

  it("exports required facility and booking functions", () => {
    expect(typeof api.getFacilities).toBe("function");
    expect(typeof api.createFacility).toBe("function");
    expect(typeof api.getBookings).toBe("function");
    expect(typeof api.createBooking).toBe("function");
    expect(typeof api.cancelBooking).toBe("function");
  });

  it("exports required announcement functions", () => {
    expect(typeof api.getAnnouncements).toBe("function");
    expect(typeof api.createAnnouncement).toBe("function");
    expect(typeof api.archiveAnnouncement).toBe("function");
  });

  it("exports required service request functions", () => {
    expect(typeof api.getServiceRequests).toBe("function");
    expect(typeof api.createServiceRequest).toBe("function");
    expect(typeof api.updateServiceRequestStatus).toBe("function");
    expect(typeof api.assignServiceRequestStaff).toBe("function");
  });
});
