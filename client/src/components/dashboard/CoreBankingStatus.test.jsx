import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CoreBankingStatus from "./CoreBankingStatus";

describe("CoreBankingStatus Component", () => {
  it("renders core banking status widget correctly", () => {
    render(<CoreBankingStatus />);
    expect(screen.getByText("Core Banking Integration")).toBeInTheDocument();
    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(screen.getByText("Secure Tunnel")).toBeInTheDocument();
  });
});
