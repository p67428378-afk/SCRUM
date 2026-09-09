import { describe, it, expect } from "vitest";
import api, { authApi, booksApi, loansApi, apiClient } from "./api";

describe("API Services Structure", () => {
  it("should define and export apiClient axios instance", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults).toBeDefined();
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("should have all required auth API methods", () => {
    expect(typeof authApi.login).toBe("function");
    expect(typeof authApi.register).toBe("function");
    expect(typeof authApi.getMe).toBe("function");
    expect(typeof authApi.updateMe).toBe("function");
    expect(typeof authApi.getPatrons).toBe("function");
    expect(typeof authApi.getPatron).toBe("function");
    expect(typeof authApi.updatePatron).toBe("function");
  });

  it("should have all required books API methods", () => {
    expect(typeof booksApi.getBooks).toBe("function");
    expect(typeof booksApi.getBook).toBe("function");
    expect(typeof booksApi.createBook).toBe("function");
    expect(typeof booksApi.updateBook).toBe("function");
    expect(typeof booksApi.deleteBook).toBe("function");
  });

  it("should have all required loans API methods", () => {
    expect(typeof loansApi.checkout).toBe("function");
    expect(typeof loansApi.returnBook).toBe("function");
    expect(typeof loansApi.renewLoan).toBe("function");
    expect(typeof loansApi.getOverdueLoans).toBe("function");
    expect(typeof loansApi.getPatronLoans).toBe("function");
    expect(typeof loansApi.getAllLoans).toBe("function");
  });

  it("default export should bundle all domain apis", () => {
    expect(api.auth).toBe(authApi);
    expect(api.books).toBe(booksApi);
    expect(api.loans).toBe(loansApi);
  });
});
