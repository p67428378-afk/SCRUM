import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import TaskDashboardPage from "../pages/TaskDashboardPage";

vi.mock("../services/api", () => ({
  authAPI: {
    getCurrentUser: vi
      .fn()
      .mockResolvedValue({ id: "u1", email: "test@example.com" }),
    login: vi.fn().mockResolvedValue({ access_token: "fake-token" }),
    register: vi.fn().mockResolvedValue({ id: "u1" }),
  },
  tasksAPI: {
    listTasks: vi.fn().mockResolvedValue([
      {
        task_id: "task-001",
        action_type: "report_generation",
        status: "success",
        created_at: "2026-05-18T10:00:00Z",
        updated_at: "2026-05-18T10:00:05Z",
      },
    ]),
    createTask: vi.fn().mockResolvedValue({
      task_id: "task-002",
      status: "pending",
      action_type: "file_upload",
      created_at: new Date().toISOString(),
      status_url: "/api/v1/tasks/task-002/status",
    }),
    getTaskStatus: vi.fn().mockResolvedValue({
      task_id: "task-002",
      status: "pending",
      action_type: "file_upload",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      elapsed_seconds: 5,
      is_escalated: false,
    }),
  },
}));

describe("TaskDashboardPage Component", () => {
  const mockTaskTracker = {
    taskId: null,
    taskState: {
      task_id: null,
      status: "idle",
      action_type: "report_generation",
      elapsed_seconds: 0,
      is_escalated: false,
      result: null,
      error: null,
    },
    connectionMode: "polling",
    wsConnected: false,
    initiateTask: vi.fn(),
    resetTask: vi.fn(),
  };

  it("renders dashboard heading and submit form", async () => {
    render(
      <BrowserRouter>
        <TaskDashboardPage taskTracker={mockTaskTracker} />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Submit New Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Authenticated Test Account/i)).toBeInTheDocument();
  });

  it("renders action type buttons", () => {
    render(
      <BrowserRouter>
        <TaskDashboardPage taskTracker={mockTaskTracker} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Report Generation")).toBeInTheDocument();
    expect(screen.getByText("File Upload")).toBeInTheDocument();
    expect(screen.getByText("Payment Processing")).toBeInTheDocument();
    expect(screen.getByText("Data Sync")).toBeInTheDocument();
  });
});
