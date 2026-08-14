import { describe, it, expect, vi } from "vitest";
import * as api from "./api";

vi.mock("axios", () => {
  const mockAxiosInstance = {
    post: vi.fn(() => Promise.resolve({ data: { success: true } })),
    get: vi.fn(() => Promise.resolve({ data: { success: true } })),
    put: vi.fn(() => Promise.resolve({ data: { success: true } })),
    delete: vi.fn(() => Promise.resolve({ data: { success: true } })),
    patch: vi.fn(() => Promise.resolve({ data: { success: true } })),
  };
  return {
    default: {
      create: () => mockAxiosInstance,
    },
  };
});

describe("API Service", () => {
  it("should export all required API functions", () => {
    expect(api.createUser).toBeTypeOf("function");
    expect(api.getUserDetails).toBeTypeOf("function");
    expect(api.updateUser).toBeTypeOf("function");
    expect(api.deactivateUser).toBeTypeOf("function");
    expect(api.getRoles).toBeTypeOf("function");
    expect(api.createRole).toBeTypeOf("function");
    expect(api.assignUserRoles).toBeTypeOf("function");
    expect(api.getPermissions).toBeTypeOf("function");
    expect(api.updateUserPermissions).toBeTypeOf("function");
    expect(api.updateRolePermissions).toBeTypeOf("function");
    expect(api.getDashboardUsers).toBeTypeOf("function");
    expect(api.getDashboardRoles).toBeTypeOf("function");
    expect(api.getAuditLogs).toBeTypeOf("function");
  });
});
