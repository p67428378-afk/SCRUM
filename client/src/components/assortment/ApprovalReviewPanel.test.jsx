import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ApprovalReviewPanel from "./ApprovalReviewPanel.jsx";

describe("ApprovalReviewPanel", () => {
  const mockScenarioData = {
    name: "balanced",
    sku_action_summary: { grow: 5, maintain: 15, reduce: 2, swap: 3 },
    guardrails: {
      private_brand_goal_met: true,
      shelf_space_limit_ok: true,
    },
  };

  it("renders the panel with scenario data", () => {
    const onSubmit = vi.fn();
    render(
      <ApprovalReviewPanel
        scenarioData={mockScenarioData}
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    );

    expect(screen.getByText("Assortment Review")).toBeInTheDocument();
    expect(screen.getByText("Proposed Actions (BALANCED)")).toBeInTheDocument();
    expect(screen.getByText("5 SKUs")).toBeInTheDocument();
    expect(screen.getByText("3 SKUs")).toBeInTheDocument();
    expect(screen.getByText("2 SKUs")).toBeInTheDocument();
  });

  it("renders without scenario name gracefully", () => {
    const onSubmit = vi.fn();
    const dataWithoutName = {
      ...mockScenarioData,
      name: undefined,
    };
    render(
      <ApprovalReviewPanel
        scenarioData={dataWithoutName}
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    );

    expect(screen.getByText("Proposed Actions")).toBeInTheDocument();
    expect(screen.queryByText("Proposed Actions ()")).not.toBeInTheDocument();
  });

  it("calls onSubmit when submit button is clicked", () => {
    const onSubmit = vi.fn();
    render(
      <ApprovalReviewPanel
        scenarioData={mockScenarioData}
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /submit assortment review/i,
    });
    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("disables button when submitting", () => {
    const onSubmit = vi.fn();
    render(
      <ApprovalReviewPanel
        scenarioData={mockScenarioData}
        onSubmit={onSubmit}
        isSubmitting={true}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /submitting.../i,
    });
    expect(submitButton).toBeDisabled();
  });
});
