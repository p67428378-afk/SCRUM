import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";
import { authService } from "./services/api";

// Mock the api services
vi.mock("./services/api", () => {
  return {
    authService: {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(() => null),
      isAuthenticated: vi.fn(() => false),
    },
    bookingsService: {
      getBookings: vi.fn(() => Promise.resolve([])),
      getBookingDetails: vi.fn(() => Promise.resolve({})),
      updateBooking: vi.fn(() => Promise.resolve({})),
    },
    availabilityService: {
      getAvailability: vi.fn(() => Promise.resolve([])),
      setAvailability: vi.fn(() => Promise.resolve({})),
    },
    notificationsService: {
      getNotifications: vi.fn(() => Promise.resolve([])),
      markAsRead: vi.fn(() => Promise.resolve({})),
    },
  };
});

describe("App Component & Login Page", () => {
  it("renders the login page when not authenticated", () => {
    render(<App />);
    expect(
      screen.getByText("Sign in to manage your bookings and availability"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Demo Login/i }),
    ).toBeInTheDocument();
  });

  it("calls authService.login with demo credentials when Demo Login is clicked", async () => {
    authService.login.mockResolvedValueOnce({
      access_token: "mock-token",
      guide: {},
    });

    // Mock window.location safely using stubGlobal
    const mockLocation = new URL("http://localhost:3000/login");
    let hrefValue = "http://localhost:3000/login";
    Object.defineProperty(mockLocation, "href", {
      get: () => hrefValue,
      set: (val) => {
        hrefValue = val;
      },
      configurable: true,
    });
    vi.stubGlobal("location", mockLocation);

    render(<App />);

    const demoButton = screen.getByRole("button", { name: /Demo Login/i });
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        "test@example.com",
        "testpassword",
      );
      expect(location.href).toBe("/");
    });

    vi.unstubAllGlobals();
  });
});
