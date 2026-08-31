import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { TaskCard } from "./TaskCard";

const mockTask = {
  id: "task-101",
  project_id: "proj-123",
  summary: "Implement Auth API",
  description: "Write FastAPI endpoints for JWT login",
  priority: "High",
  status: "In Progress",
  assignee_id: "user-2",
  due_date: "2026-09-15T00:00:00Z",
};

const mockUsers = [
  { id: "user-2", full_name: "Alice Developer", email: "alice@example.com" },
];

describe("TaskCard Component", () => {
  it("renders task summary and priority", () => {
    render(
      <BrowserRouter>
        <TaskCard task={mockTask} users={mockUsers} />
      </BrowserRouter>,
    );
    expect(screen.getByText("Implement Auth API")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Alice Developer")).toBeInTheDocument();
  });

  it("calls onEdit callback when edit icon is clicked", () => {
    const handleEdit = vi.fn();
    render(
      <BrowserRouter>
        <TaskCard task={mockTask} users={mockUsers} onEdit={handleEdit} />
      </BrowserRouter>,
    );
    const editBtn = screen.getByLabelText("Edit task");
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockTask);
  });
});
