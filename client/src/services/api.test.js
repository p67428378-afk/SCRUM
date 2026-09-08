import { describe, it, expect } from "vitest";
import api, {
  authService,
  catalogService,
  cartService,
  orderService,
  apiClient,
} from "./api";

describe("API Service Layer Structural Verification", () => {
  it("should export an apiClient axios instance with base configuration", () => {
    expect(apiClient).toBeDefined();
    expect(typeof apiClient.get).toBe("function");
    expect(typeof apiClient.post).toBe("function");
    expect(typeof apiClient.put).toBe("function");
    expect(typeof apiClient.delete).toBe("function");
  });

  it("should export complete authService methods", () => {
    expect(authService).toBeDefined();
    expect(typeof authService.register).toBe("function");
    expect(typeof authService.login).toBe("function");
    expect(typeof authService.getCurrentUser).toBe("function");
    expect(typeof authService.logout).toBe("function");
    expect(typeof authService.getStoredUser).toBe("function");
    expect(typeof authService.isAuthenticated).toBe("function");
  });

  it("should export complete catalogService methods", () => {
    expect(catalogService).toBeDefined();
    expect(typeof catalogService.getCategories).toBe("function");
    expect(typeof catalogService.getBooks).toBe("function");
    expect(typeof catalogService.getBookById).toBe("function");
  });

  it("should export complete cartService methods", () => {
    expect(cartService).toBeDefined();
    expect(typeof cartService.getCart).toBe("function");
    expect(typeof cartService.addItem).toBe("function");
    expect(typeof cartService.updateItemQuantity).toBe("function");
    expect(typeof cartService.removeItem).toBe("function");
    expect(typeof cartService.clearCart).toBe("function");
  });

  it("should export complete orderService methods", () => {
    expect(orderService).toBeDefined();
    expect(typeof orderService.checkout).toBe("function");
    expect(typeof orderService.getOrders).toBe("function");
    expect(typeof orderService.getOrderById).toBe("function");
  });

  it("should handle stored user retrieval and logout safely", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "test@example.com", full_name: "Alex" }),
    );
    expect(authService.getStoredUser()).toEqual({
      email: "test@example.com",
      full_name: "Alex",
    });

    authService.logout();
    expect(authService.getStoredUser()).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
  });
});
