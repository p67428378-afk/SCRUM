import { describe, test, expect } from "vitest";
import * as apiServices from "./api";

describe("API Services Module", () => {
  test("exports required API contract functions", () => {
    expect(typeof apiServices.registerUser).toBe("function");
    expect(typeof apiServices.loginUser).toBe("function");
    expect(typeof apiServices.getUserProfile).toBe("function");
    expect(typeof apiServices.getProducts).toBe("function");
    expect(typeof apiServices.getProductById).toBe("function");
    expect(typeof apiServices.getCart).toBe("function");
    expect(typeof apiServices.addToCart).toBe("function");
    expect(typeof apiServices.updateCartItem).toBe("function");
    expect(typeof apiServices.removeCartItem).toBe("function");
    expect(typeof apiServices.checkout).toBe("function");
    expect(typeof apiServices.getUserOrders).toBe("function");
    expect(typeof apiServices.getOrderById).toBe("function");
    expect(typeof apiServices.getWishlist).toBe("function");
    expect(typeof apiServices.addToWishlist).toBe("function");
    expect(typeof apiServices.removeFromWishlist).toBe("function");
    expect(typeof apiServices.moveToCartFromWishlist).toBe("function");
  });
});
