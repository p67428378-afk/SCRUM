import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import DryRunSuccessBanner from "./DryRunSuccessBanner.jsx";

describe("DryRunSuccessBanner Component", () => {
  it("does not render when message is empty", () => {
    const { container } = render(
      <DryRunSuccessBanner message="" onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders message and entries processed when provided", () => {
    render(
      <DryRunSuccessBanner
        message="Dry-run completed successfully."
        entriesProcessed={100}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Dry-run successful")).toBeInTheDocument();
    expect(
      screen.getByText("Dry-run completed successfully."),
    ).toBeInTheDocument();
    expect(screen.getByText("Entries Processed: 100")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <DryRunSuccessBanner
        message="Dry-run completed successfully."
        onClose={onClose}
      />,
    );
    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
