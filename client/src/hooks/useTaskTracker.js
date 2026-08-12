import { useState, useEffect, useRef, useCallback } from "react";
import { tasksAPI, getWebSocketUrl } from "../services/api";

export function useTaskTracker(initialTaskId = null) {
  const [taskId, setTaskId] = useState(() => {
    if (initialTaskId) return initialTaskId;
    const urlParams = new URLSearchParams(window.location.search);
    const urlTaskId = urlParams.get("taskId") || urlParams.get("task_id");
    if (urlTaskId) return urlTaskId;
    return sessionStorage.getItem("active_task_id") || null;
  });

  const [taskState, setTaskState] = useState(() => {
    const saved = sessionStorage.getItem("active_task_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.task_id === taskId) {
          return parsed;
        }
      } catch (e) {
        // ignore parse error
      }
    }
    return {
      task_id: taskId,
      status: taskId ? "pending" : "idle", // 'idle' | 'submitting' | 'pending' | 'escalated_pending' | 'success' | 'failed'
      action_type: "report_generation",
      created_at: null,
      updated_at: null,
      elapsed_seconds: 0,
      is_escalated: false,
      escalation_message: null,
      result: null,
      error: null,
    };
  });

  const [connectionMode, setConnectionMode] = useState("polling"); // 'websocket' | 'polling'
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const wsRef = useRef(null);
  const pollingRef = useRef(null);

  // Sync state to sessionStorage
  useEffect(() => {
    if (taskId) {
      sessionStorage.setItem("active_task_id", taskId);
      sessionStorage.setItem("active_task_data", JSON.stringify(taskState));

      // Keep URL query param synced without full reload
      const url = new URL(window.location.href);
      if (url.searchParams.get("taskId") !== taskId) {
        url.searchParams.set("taskId", taskId);
        window.history.replaceState({}, "", url.toString());
      }
    } else {
      sessionStorage.removeItem("active_task_id");
      sessionStorage.removeItem("active_task_data");
    }
  }, [taskId, taskState]);

  // Timer for elapsed seconds and 30s escalation
  useEffect(() => {
    if (
      taskState.status === "pending" ||
      taskState.status === "submitting" ||
      taskState.status === "escalated_pending"
    ) {
      timerRef.current = setInterval(() => {
        setTaskState((prev) => {
          const newElapsed = prev.elapsed_seconds + 1;
          const isEscalatedNow = newElapsed >= 30;
          return {
            ...prev,
            elapsed_seconds: newElapsed,
            is_escalated: isEscalatedNow,
            status:
              isEscalatedNow && prev.status === "pending"
                ? "escalated_pending"
                : prev.status,
            escalation_message: isEscalatedNow
              ? "This operation is taking longer than usual due to processing load. You may safely stay on this page or navigate away — processing continues in the background."
              : prev.escalation_message,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [taskState.status]);

  // Function to poll backend
  const fetchStatus = useCallback(async (currentTaskId) => {
    if (!currentTaskId) return;
    try {
      const data = await tasksAPI.getTaskStatus(currentTaskId);
      setTaskState((prev) => {
        const isEscalated = data.is_escalated || prev.elapsed_seconds >= 30;
        let finalStatus = data.status;
        if (data.status === "pending" && isEscalated) {
          finalStatus = "escalated_pending";
        }
        return {
          ...prev,
          ...data,
          status: finalStatus,
          is_escalated: isEscalated,
          escalation_message:
            data.escalation_message ||
            (isEscalated
              ? "This operation is taking longer than usual due to processing load. You may safely stay on this page or navigate away."
              : null),
        };
      });
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Task expired or not found. Please start a new request.");
        setTaskState((prev) => ({
          ...prev,
          status: "failed",
          error: {
            code: "TASK_NOT_FOUND",
            reason: "Task ID expired or not found on server.",
          },
        }));
      } else {
        // Network error during poll
      }
    }
  }, []);

  // Subscribe via WebSocket with Polling fallback
  useEffect(() => {
    if (
      !taskId ||
      taskState.status === "success" ||
      taskState.status === "failed"
    ) {
      return;
    }

    // Try WebSocket
    let ws;
    try {
      const wsUrl = getWebSocketUrl(taskId);
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setConnectionMode("websocket");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.status) {
            setTaskState((prev) => {
              const isEscalated = prev.elapsed_seconds >= 30;
              let finalStatus = message.status;
              if (message.status === "pending" && isEscalated) {
                finalStatus = "escalated_pending";
              }
              return {
                ...prev,
                status: finalStatus,
                updated_at: message.updated_at || new Date().toISOString(),
                result: message.result || prev.result,
                error: message.error || prev.error,
              };
            });
          }
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
        setConnectionMode("polling");
      };

      ws.onclose = () => {
        setWsConnected(false);
        setConnectionMode("polling");
      };
    } catch (e) {
      setConnectionMode("polling");
    }

    // Polling backup loop (runs every 3s regardless or if WS is offline)
    pollingRef.current = setInterval(() => {
      fetchStatus(taskId);
    }, 3000);

    // Initial fetch on mount / re-hydration
    fetchStatus(taskId);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [taskId, taskState.status, fetchStatus]);

  // Immediate Optimistic Submit
  const initiateTask = async (
    actionType = "report_generation",
    parameters = {},
  ) => {
    // Synchronous immediate processing lock at t=0ms
    setTaskState({
      task_id: null,
      status: "submitting",
      action_type: actionType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      elapsed_seconds: 0,
      is_escalated: false,
      escalation_message: null,
      result: null,
      error: null,
    });
    setError(null);
    startTimeRef.current = Date.now();

    try {
      const response = await tasksAPI.createTask(actionType, parameters);
      const newTaskId = response.task_id;

      setTaskId(newTaskId);
      setTaskState({
        task_id: newTaskId,
        status: response.status || "pending",
        action_type: actionType,
        created_at: response.created_at || new Date().toISOString(),
        updated_at: response.created_at || new Date().toISOString(),
        elapsed_seconds: 0,
        is_escalated: false,
        escalation_message: null,
        result: null,
        error: null,
      });

      return newTaskId;
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      const reason =
        typeof errorDetail === "string"
          ? errorDetail
          : err.message || "Failed to trigger task";
      const errCode = err.response?.data?.code || "TASK_SUBMISSION_FAILED";

      setTaskState((prev) => ({
        ...prev,
        status: "failed",
        error: {
          code: errCode,
          reason: reason,
        },
      }));
      setError(reason);
      throw err;
    }
  };

  const resetTask = () => {
    setTaskId(null);
    setTaskState({
      task_id: null,
      status: "idle",
      action_type: "report_generation",
      created_at: null,
      updated_at: null,
      elapsed_seconds: 0,
      is_escalated: false,
      escalation_message: null,
      result: null,
      error: null,
    });
    setError(null);
    sessionStorage.removeItem("active_task_id");
    sessionStorage.removeItem("active_task_data");
    const url = new URL(window.location.href);
    url.searchParams.delete("taskId");
    url.searchParams.delete("task_id");
    window.history.replaceState({}, "", url.toString());
  };

  return {
    taskId,
    taskState,
    connectionMode,
    wsConnected,
    error,
    initiateTask,
    fetchStatus: () => fetchStatus(taskId),
    resetTask,
  };
}
