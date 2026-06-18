import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotificationsPanel from "./NotificationsPanel";

const mockNotifications = [
  {
    notification_id: "notif-1",
    message: "New booking request from John Doe",
    is_read: false,
    created_at: "2026-06-18T05:55:22.468953+00:00",
  },
];

describe("NotificationsPanel Component", () => {
  it("renders notifications correctly", () => {
    render(<NotificationsPanel notifications={mockNotifications} />);

    expect(screen.getByText("Recent Notifications")).toBeInTheDocument();
    expect(
      screen.getByText("New booking request from John Doe"),
    ).toBeInTheDocument();
  });

  it("renders empty state when no notifications are provided", () => {
    render(<NotificationsPanel notifications={[]} />);

    expect(screen.getByText("No new notifications.")).toBeInTheDocument();
  });
});
