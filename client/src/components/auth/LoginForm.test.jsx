import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginForm from "./LoginForm";

describe("LoginForm Component", () => {
  it("renders login form with pre-filled test credentials", () => {
    render(<LoginForm onLoginSuccess={vi.fn()} />);

    expect(screen.getByLabelText(/username/i)).toHaveValue("testuser");
    expect(screen.getByLabelText(/password/i)).toHaveValue("testpassword");
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("calls onLoginSuccess with credentials when submitted", async () => {
    const mockLoginSuccess = vi.fn();
    render(<LoginForm onLoginSuccess={mockLoginSuccess} />);

    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitButton);

    expect(mockLoginSuccess).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpassword",
    });
  });
});
