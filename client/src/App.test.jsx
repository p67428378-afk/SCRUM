import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import App from "./App.jsx";
import * as api from "./services/api.js";

// Mock the API service
vi.mock("./services/api.js", () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

describe("TaskFlow App Smoke & Integration Tests", () => {
  const mockTodos = [
    {
      id: "1",
      title: "Buy milk",
      description: "Get 2% milk from the store",
      completed: false,
      isDeleted: false,
      created_at: "2026-07-17T12:00:00.000Z",
      updated_at: "2026-07-17T12:00:00.000Z",
    },
    {
      id: "2",
      title: "Prepare presentation",
      description: "Draft slides for the Q3 review",
      completed: true,
      isDeleted: false,
      created_at: "2026-07-16T12:00:00.000Z",
      updated_at: "2026-07-16T12:00:00.000Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.getTodos.mockResolvedValue({
      todos: mockTodos,
      currentPage: 1,
      totalPages: 1,
      totalTodos: 2,
    });
  });

  it("renders the dashboard with sidebar, header, and KPIs", async () => {
    render(<App />);

    // Check sidebar brand
    expect(screen.getByText("TaskFlow")).toBeInTheDocument();
    expect(screen.getByText("Productivity Suite")).toBeInTheDocument();

    // Check header search input
    expect(screen.getByPlaceholderText("Search tasks...")).toBeInTheDocument();

    // Wait for tasks to load and verify KPIs
    await waitFor(() => {
      expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    });

    // Verify tasks are rendered
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("Get 2% milk from the store")).toBeInTheDocument();
    expect(screen.getByText("Prepare presentation")).toBeInTheDocument();
  });

  it("allows adding a new task", async () => {
    api.createTodo.mockResolvedValue({
      id: "3",
      title: "New Task",
      description: "New Desc",
      completed: false,
      isDeleted: false,
      created_at: "2026-07-17T12:00:00.000Z",
      updated_at: "2026-07-17T12:00:00.000Z",
    });

    render(<App />);

    const titleInput = screen.getByPlaceholderText(
      "Task Title (e.g., Buy groceries)",
    );
    const descInput = screen.getByPlaceholderText(
      "Description (e.g., Get milk, eggs, and bread from the store)",
    );
    const submitButton = screen.getByRole("button", { name: /Add Task/i });

    fireEvent.change(titleInput, { target: { value: "New Task" } });
    fireEvent.change(descInput, { target: { value: "New Desc" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createTodo).toHaveBeenCalledWith("New Task", "New Desc");
    });
  });
});
