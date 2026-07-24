import { describe, it, expect, vi } from "vitest";
import { authService } from "./api";

describe("API Services", () => {
  it("has authService defined with expected methods", () => {
    expect(authService).toBeDefined();
    expect(authService.login).toBeTypeOf("function");
    expect(authService.verifyMfa).toBeTypeOf("function");
    expect(authService.resendMfa).toBeTypeOf("function");
    expect(authService.logout).toBeTypeOf("function");
    expect(authService.stepUp).toBeTypeOf("function");
    expect(authService.getCurrentUser).toBeTypeOf("function");
  });
});
