import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TimerBanner from "./common/TimerBanner";

describe("TimerBanner Component", () => {
  it("renders the 10-Minute Hold Lock title", () => {
    render(<TimerBanner />);
    expect(screen.getByText(/10-Minute Hold Lock Active/i)).toBeInTheDocument();
  });

  it("displays countdown formatted time", () => {
    const futureTime = new Date(Date.now() + 600000).toISOString();
    render(<TimerBanner expiresAt={futureTime} />);
    expect(screen.getByText(/Time Remaining:/i)).toBeInTheDocument();
  });
});
