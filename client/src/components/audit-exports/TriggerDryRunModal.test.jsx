import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import TriggerDryRunModal from "./TriggerDryRunModal.jsx";

describe("TriggerDryRunModal Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <TriggerDryRunModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isLoading={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders confirmation message when open and no success/error", () => {
    render(
      <TriggerDryRunModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isLoading={false}
      />,
    );
    expect(screen.getByText("Trigger Dry-Run Export")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to trigger an immediate, non-persisting dry-run/i,
      ),
    ).toBeInTheDocument();
  });

  it("calls onConfirm when clicking Run Simulation", () => {
    const onConfirm = vi.fn();
    render(
      <TriggerDryRunModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        isLoading={false}
      />,
    );
    const confirmButton = screen.getByText("Run Simulation");
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders success message and entries processed when provided", () => {
    render(
      <TriggerDryRunModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isLoading={false}
        successMessage="Dry-run completed successfully."
        entriesProcessed={42}
      />,
    );
    expect(screen.getByText("Dry-Run Successful")).toBeInTheDocument();
    expect(
      screen.getByText("Dry-run completed successfully."),
    ).toBeInTheDocument();
    expect(screen.getByText("Entries Processed: 42")).toBeInTheDocument();
  });

  it("renders error message when provided", () => {
    render(
      <TriggerDryRunModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isLoading={false}
        error="Something went wrong."
      />,
    );
    expect(screen.getByText("Dry-Run Failed")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });
});
