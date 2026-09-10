import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

vi.mock("./services/api", () => ({
  api: {
    getBooks: vi.fn().mockResolvedValue([]),
    getMembers: vi.fn().mockResolvedValue([]),
    getLoans: vi.fn().mockResolvedValue([]),
    getMyLoans: vi.fn().mockResolvedValue([]),
    login: vi.fn(),
  },
}));

describe("App Root Component", () => {
  it("renders application brand and navigation", () => {
    render(<App />);
    expect(screen.getByText("BiblioCentral Library")).toBeInTheDocument();
    expect(screen.getByText("Catalog Search")).toBeInTheDocument();
    expect(screen.getByText("My Loans")).toBeInTheDocument();
  });
});
