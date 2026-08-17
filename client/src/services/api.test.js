import { describe, it, expect } from "vitest";
import api, { apiClient } from "./api";

describe("API Services Module", () => {
  it("exports API functions", () => {
    expect(typeof api.getPortfolio).toBe("function");
    expect(typeof api.getConcerts).toBe("function");
    expect(typeof api.getConcertDetail).toBe("function");
    expect(typeof api.reserveTickets).toBe("function");
    expect(typeof api.createPaymentIntent).toBe("function");
    expect(typeof api.bookTickets).toBe("function");
  });

  it("configures axios client with default baseURL fallback", () => {
    expect(apiClient.defaults.baseURL).toBeTruthy();
    expect(apiClient.defaults.baseURL).toContain("http");
  });
});
