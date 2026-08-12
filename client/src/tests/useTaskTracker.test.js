import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTaskTracker } from "../hooks/useTaskTracker";
import { tasksAPI } from "../services/api";

vi.mock("../services/api", () => ({
  tasksAPI: {
    createTask: vi.fn(),
    getTaskStatus: vi.fn(),
    listTasks: vi.fn(),
  },
  getWebSocketUrl: vi.fn(
    () => "ws://localhost:8000/api/v1/ws/tasks/test-task-id?token=test",
  ),
}));

describe("useTaskTracker custom hook", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("initializes with idle status when no task_id provided", () => {
    const { result } = renderHook(() => useTaskTracker());
    expect(result.current.taskId).toBeNull();
    expect(result.current.taskState.status).toBe("idle");
  });

  it("triggers immediate optimistic submitting status on initiateTask", async () => {
    tasksAPI.createTask.mockResolvedValueOnce({
      task_id: "task-12345",
      status: "pending",
      action_type: "report_generation",
      created_at: new Date().toISOString(),
      status_url: "/api/v1/tasks/task-12345/status",
    });

    const { result } = renderHook(() => useTaskTracker());

    let promise;
    act(() => {
      promise = result.current.initiateTask("report_generation", {});
    });

    // Instant optimistic lock at t=0ms
    expect(result.current.taskState.status).toBe("submitting");

    await act(async () => {
      await promise;
    });

    expect(result.current.taskId).toBe("task-12345");
    expect(result.current.taskState.status).toBe("pending");
  });

  it("handles detailed error response on failure", async () => {
    tasksAPI.createTask.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          code: "PAY_402",
          detail:
            "Payment Failed: Credit card declined due to insufficient funds (Error Code: PAY_402)",
        },
      },
    });

    const { result } = renderHook(() => useTaskTracker());

    await act(async () => {
      try {
        await result.current.initiateTask("payment_processing", {});
      } catch (e) {
        // expected
      }
    });

    expect(result.current.taskState.status).toBe("failed");
    expect(result.current.taskState.error.code).toBe("PAY_402");
    expect(result.current.taskState.error.reason).toContain(
      "Credit card declined",
    );
  });

  it("resets task session cleanly", () => {
    const { result } = renderHook(() => useTaskTracker("test-id-99"));
    expect(result.current.taskId).toBe("test-id-99");

    act(() => {
      result.current.resetTask();
    });

    expect(result.current.taskId).toBeNull();
    expect(result.current.taskState.status).toBe("idle");
  });
});
