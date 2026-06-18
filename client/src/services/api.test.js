import { describe, it, expect } from "vitest";
import {
  authService,
  bookingsService,
  availabilityService,
  notificationsService,
} from "./api";

describe("API Services Structure", () => {
  it("should export authService with correct methods", () => {
    expect(authService).toBeDefined();
    expect(authService.login).toBeTypeOf("function");
    expect(authService.logout).toBeTypeOf("function");
    expect(authService.getCurrentUser).toBeTypeOf("function");
    expect(authService.isAuthenticated).toBeTypeOf("function");
  });

  it("should export bookingsService with correct methods", () => {
    expect(bookingsService).toBeDefined();
    expect(bookingsService.getBookings).toBeTypeOf("function");
    expect(bookingsService.getBookingDetails).toBeTypeOf("function");
    expect(bookingsService.updateBooking).toBeTypeOf("function");
  });

  it("should export availabilityService with correct methods", () => {
    expect(availabilityService).toBeDefined();
    expect(availabilityService.getAvailability).toBeTypeOf("function");
    expect(availabilityService.setAvailability).toBeTypeOf("function");
  });

  it("should export notificationsService with correct methods", () => {
    expect(notificationsService).toBeDefined();
    expect(notificationsService.getNotifications).toBeTypeOf("function");
    expect(notificationsService.markAsRead).toBeTypeOf("function");
  });
});
