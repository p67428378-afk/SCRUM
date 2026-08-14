import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import TaskTable from "./TaskTable";

describe("TaskTable Component", () => {
  const sampleTasks = [
    {
      id: "1",
      title: "Submit Quarterly Financials",
      description: "Prepare tax documents",
      status: "Pending",
      priority: "High",
      due_date: "2026-04-15T17:00:00Z",
      tags: ["finance", "urgent"],
    },
    {
      id: "2",
      title: "Design UI Mockups",
      description: "Figma dashboard redesign",
      status: "Completed",
      priority: "Medium",
      due_date: "2026-03-30T12:00:00Z",
      tags: ["design"],
    },
  ];

  it("renders task list items correctly", () => {
    render(<TaskTable tasks={sampleTasks} total={2} skip={0} limit={20} />);
    expect(screen.getByText("Submit Quarterly Financials")).toBeInTheDocument();
    expect(screen.getByText("Design UI Mockups")).toBeInTheDocument();
  });

  it("renders empty state when tasks list is empty", () => {
    render(<TaskTable tasks={[]} total={0} skip={0} limit={20} />);
    expect(screen.getByText("No tasks found")).toBeInTheDocument();
  });
});
