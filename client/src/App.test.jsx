import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import App from "./App.jsx";

// Mock the API services
vi.mock("./services/api.js", () => {
  return {
    getExportStatus: vi.fn(() =>
      Promise.resolve({
        last_run: {
          job_id: "job_8f9a2c3d",
          started_at: "2026-01-01T01:00:00Z",
          completed_at: "2026-01-01T01:05:00Z",
          status: "SUCCESS",
          file_name: "audit_log_2026-01-01.csv.enc",
          file_size_mb: 5.4,
        },
        next_run_scheduled_at: "2026-01-02T01:00:00Z",
        history: [
          {
            job_id: "job_8f9a2c3d",
            started_at: "2026-01-01T01:00:00Z",
            status: "SUCCESS",
          },
          {
            job_id: "job_3e4f5a6b",
            started_at: "2025-12-30T01:00:00Z",
            status: "FAILED",
            error_message: "Failed to connect to GCS bucket.",
          },
        ],
      }),
    ),
    getExportConfig: vi.fn(() =>
      Promise.resolve({
        gcs_bucket_name: "enterprise-audit-logs-bucket",
        encryption_standard: "AES-256",
        retention_days: 2555,
        schedule_cron: "0 1 * * *",
      }),
    ),
    triggerExport: vi.fn(() =>
      Promise.resolve({
        message: "Audit log export process initiated successfully.",
        job_id: "new-job-uuid",
      }),
    ),
    updateExportConfig: vi.fn(() =>
      Promise.resolve({
        gcs_bucket_name: "updated-bucket",
        encryption_standard: "AES-256",
        retention_days: 2555,
        schedule_cron: "0 1 * * *",
      }),
    ),
    triggerDryRun: vi.fn(() =>
      Promise.resolve({
        status: "SUCCESS",
        message: "Dry-run simulation completed successfully.",
        entries_processed: 150,
      }),
    ),
  };
});

describe("Audit Log Export Dashboard Smoke Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard with title and key elements", async () => {
    render(<App />);

    // Check if the main title is rendered
    expect(screen.getByText("Audit Log Export Dashboard")).toBeInTheDocument();

    // Check if the sidebar logo is rendered
    expect(screen.getByText("SecureLog")).toBeInTheDocument();

    // Check if the trigger button is rendered
    expect(screen.getByText("Trigger Export Now")).toBeInTheDocument();

    // Check if the dry-run button is rendered
    expect(screen.getByText("Trigger Dry-Run")).toBeInTheDocument();
  });

  it("renders stat cards with correct values", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Last Run Status")).toBeInTheDocument();
      expect(screen.getByText("Next Scheduled Run")).toBeInTheDocument();
      expect(screen.getByText("Retention Policy")).toBeInTheDocument();
      expect(screen.getByText("Encryption Standard")).toBeInTheDocument();
    });
  });

  it("opens the trigger export modal when clicking the trigger button", async () => {
    render(<App />);

    const triggerButton = screen.getByText("Trigger Export Now");
    fireEvent.click(triggerButton);

    expect(screen.getByText("Trigger Manual Export")).toBeInTheDocument();
    expect(screen.getByText("Trigger Now")).toBeInTheDocument();
  });

  it("opens the trigger dry-run modal when clicking the dry-run button", async () => {
    render(<App />);

    const dryRunButton = screen.getByText("Trigger Dry-Run");
    fireEvent.click(dryRunButton);

    expect(screen.getByText("Trigger Dry-Run Export")).toBeInTheDocument();
    expect(screen.getByText("Run Simulation")).toBeInTheDocument();
  });
});
