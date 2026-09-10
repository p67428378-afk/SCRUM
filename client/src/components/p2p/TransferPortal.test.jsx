import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TransferPortal from "./TransferPortal";

describe("TransferPortal Component", () => {
  it("renders portal header and main layout sections", () => {
    render(<TransferPortal />);

    expect(screen.getByText(/Apex PayVault/i)).toBeInTheDocument();
    expect(screen.getByText(/Initiate P2P Transfer/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Recent P2P Transfer History/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Fraud Risk & Limits/i)).toBeInTheDocument();
  });
});
