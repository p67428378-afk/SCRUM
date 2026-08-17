import { describe, it, expect } from "vitest";
import { authApi, attendanceApi, approvalsApi, adminApi } from "./api";

describe("API Services Export Test", () => {
  it("exports authApi methods", () => {
    expect(typeof authApi.login).toBe("function");
    expect(typeof authApi.register).toBe("function");
    expect(typeof authApi.getMe).toBe("function");
    expect(typeof authApi.logout).toBe("function");
  });

  it("exports attendanceApi methods", () => {
    expect(typeof attendanceApi.checkIn).toBe("function");
    expect(typeof attendanceApi.checkOut).toBe("function");
    expect(typeof attendanceApi.getHistory).toBe("function");
    expect(typeof attendanceApi.getTeamHistory).toBe("function");
  });

  it("exports approvalsApi methods", () => {
    expect(typeof approvalsApi.submitRequest).toBe("function");
    expect(typeof approvalsApi.getRequests).toBe("function");
    expect(typeof approvalsApi.updateRequest).toBe("function");
  });

  it("exports adminApi methods", () => {
    expect(typeof adminApi.adjustAttendance).toBe("function");
    expect(typeof adminApi.getAuditLogs).toBe("function");
  });
});
