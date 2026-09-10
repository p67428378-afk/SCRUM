import { describe, it, expect } from "vitest";
import api, {
  createTransfer,
  getTransfers,
  getTransferById,
  getBalance,
  getUsers,
  getAccounts,
  depositFunds,
  checkHealth,
} from "./api";

describe("API Service contracts", () => {
  it("exports all required API methods", () => {
    expect(typeof createTransfer).toBe("function");
    expect(typeof getTransfers).toBe("function");
    expect(typeof getTransferById).toBe("function");
    expect(typeof getBalance).toBe("function");
    expect(typeof getUsers).toBe("function");
    expect(typeof getAccounts).toBe("function");
    expect(typeof depositFunds).toBe("function");
    expect(typeof checkHealth).toBe("function");
  });

  it("default export provides all methods", () => {
    expect(api.createTransfer).toBe(createTransfer);
    expect(api.getTransfers).toBe(getTransfers);
    expect(api.getTransferById).toBe(getTransferById);
    expect(api.getBalance).toBe(getBalance);
  });
});
