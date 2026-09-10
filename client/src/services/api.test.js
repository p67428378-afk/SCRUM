import { describe, it, expect } from "vitest";
import { api } from "./api";

describe("API Service contracts", () => {
  it("exports all required endpoint functions", () => {
    expect(typeof api.login).toBe("function");
    expect(typeof api.register).toBe("function");
    expect(typeof api.getCurrentUser).toBe("function");

    expect(typeof api.getBooks).toBe("function");
    expect(typeof api.getBookById).toBe("function");
    expect(typeof api.createBook).toBe("function");
    expect(typeof api.updateBook).toBe("function");
    expect(typeof api.deleteBook).toBe("function");

    expect(typeof api.getMembers).toBe("function");
    expect(typeof api.getMemberById).toBe("function");
    expect(typeof api.createMember).toBe("function");
    expect(typeof api.updateMember).toBe("function");

    expect(typeof api.getMyLoans).toBe("function");
    expect(typeof api.getLoans).toBe("function");
    expect(typeof api.getLoanById).toBe("function");
    expect(typeof api.checkoutBook).toBe("function");
    expect(typeof api.returnBook).toBe("function");
    expect(typeof api.renewLoan).toBe("function");

    expect(typeof api.payFine).toBe("function");
    expect(typeof api.getMemberFines).toBe("function");
    expect(typeof api.recalculateOverdueFines).toBe("function");
  });
});
