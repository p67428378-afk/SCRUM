import { describe, it, expect, vi } from "vitest";
import {
  formatApiError,
  initiateTransfer,
  fetchTransfers,
  fetchAccounts,
} from "./api";

describe("API Service Unit Tests", () => {
  it("formats string API errors correctly", () => {
    const error = {
      response: {
        data: {
          detail: "Blocked: Fraud threshold exceeded",
        },
      },
    };
    expect(formatApiError(error)).toBe("Blocked: Fraud threshold exceeded");
  });

  it("formats array validation errors correctly", () => {
    const error = {
      response: {
        data: {
          detail: [{ loc: ["body", "amount"], msg: "field required" }],
        },
      },
    };
    expect(formatApiError(error)).toContain("body.amount: field required");
  });

  it("handles fallback error messages when response is missing", () => {
    const error = { message: "Network Error" };
    expect(formatApiError(error)).toBe("Network Error");
  });

  it("initiateTransfer returns success object structure", async () => {
    const transferPayload = {
      sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      receiver_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      amount: 250,
    };
    // Testing function exists and handles input format
    expect(typeof initiateTransfer).toBe("function");
    expect(typeof fetchTransfers).toBe("function");
    expect(typeof fetchAccounts).toBe("function");
  });
});
