import { describe, it, expect } from "vitest";
import {
  authApi,
  productApi,
  cartApi,
  orderApi,
  wishlistApi,
  getSessionId,
} from "./api";

describe("API Service Interface", () => {
  it("generates or retrieves a valid session id", () => {
    const sessionId = getSessionId();
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe("string");
    expect(sessionId.startsWith("sess_")).toBe(true);
  });

  it("exports all expected auth api functions", () => {
    expect(typeof authApi.register).toBe("function");
    expect(typeof authApi.login).toBe("function");
    expect(typeof authApi.getMe).toBe("function");
    expect(typeof authApi.getAddresses).toBe("function");
    expect(typeof authApi.createAddress).toBe("function");
  });

  it("exports all expected product api functions", () => {
    expect(typeof productApi.getProducts).toBe("function");
    expect(typeof productApi.getProduct).toBe("function");
    expect(typeof productApi.getCategories).toBe("function");
  });

  it("exports all expected cart api functions", () => {
    expect(typeof cartApi.getCart).toBe("function");
    expect(typeof cartApi.addToCart).toBe("function");
    expect(typeof cartApi.updateCartItem).toBe("function");
    expect(typeof cartApi.removeCartItem).toBe("function");
    expect(typeof cartApi.clearCart).toBe("function");
    expect(typeof cartApi.applyCoupon).toBe("function");
  });

  it("exports all expected order api functions", () => {
    expect(typeof orderApi.estimateCheckout).toBe("function");
    expect(typeof orderApi.createOrder).toBe("function");
    expect(typeof orderApi.getOrders).toBe("function");
    expect(typeof orderApi.getOrder).toBe("function");
  });

  it("exports all expected wishlist api functions", () => {
    expect(typeof wishlistApi.getWishlist).toBe("function");
    expect(typeof wishlistApi.addToWishlist).toBe("function");
    expect(typeof wishlistApi.removeFromWishlist).toBe("function");
  });
});
