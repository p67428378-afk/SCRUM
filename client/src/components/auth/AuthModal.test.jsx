import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthModal from "./AuthModal";

describe("AuthModal Component", () => {
  it("renders modal with test credentials helper when open", () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Welcome Back to Book Haven")).toBeInTheDocument();
    expect(screen.getByText(/Test Account Credentials:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveValue(
      "test@example.com",
    );
  });

  it("switches between Sign In and Register modes", () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} />);

    const registerTab = screen.getByRole("button", { name: "Register" });
    fireEvent.click(registerTab);

    expect(screen.getByText("Create an Account")).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <AuthModal isOpen={false} onClose={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
