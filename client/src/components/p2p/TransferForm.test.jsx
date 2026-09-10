import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TransferForm from "./TransferForm";

describe("TransferForm Component", () => {
  it("renders form inputs and submit button", () => {
    render(<TransferForm onSubmit={vi.fn()} loading={false} />);

    expect(screen.getByText(/Initiate P2P Transfer/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e.g. b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/250.00/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Money Now/i }),
    ).toBeInTheDocument();
  });

  it("validates empty inputs before submitting", () => {
    const handleSubmit = vi.fn();
    render(<TransferForm onSubmit={handleSubmit} loading={false} />);

    const submitBtn = screen.getByRole("button", { name: /Send Money Now/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Please enter a valid Recipient ID/i),
    ).toBeInTheDocument();
  });

  it("populates amount when quick chip is clicked", () => {
    render(<TransferForm onSubmit={vi.fn()} loading={false} />);

    const chip500 = screen.getByRole("button", { name: /\$500/i });
    fireEvent.click(chip500);

    const amountInput = screen.getByPlaceholderText(/250.00/i);
    expect(amountInput.value).toBe("500");
  });

  it("calls onSubmit with valid input", () => {
    const handleSubmit = vi.fn();
    render(<TransferForm onSubmit={handleSubmit} loading={false} />);

    const receiverInput = screen.getByPlaceholderText(
      /e.g. b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22/i,
    );
    const amountInput = screen.getByPlaceholderText(/250.00/i);

    fireEvent.change(receiverInput, {
      target: { value: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22" },
    });
    fireEvent.change(amountInput, { target: { value: "250.00" } });

    const submitBtn = screen.getByRole("button", { name: /Send Money Now/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      receiver_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      amount: 250,
    });
  });
});
