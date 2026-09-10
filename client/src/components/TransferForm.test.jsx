import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TransferForm from "./TransferForm";

describe("TransferForm Component", () => {
  it("renders all form input fields and submit button", () => {
    const handleSubmit = vi.fn();
    render(
      <TransferForm
        senderId="usr_alexander"
        senderBalance={5000}
        onSubmitTransfer={handleSubmit}
      />,
    );

    expect(screen.getByLabelText(/Recipient ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Transfer Amount/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Transfer/i }),
    ).toBeInTheDocument();
  });

  it("populates recipient input when quick pick button is clicked", () => {
    const handleSubmit = vi.fn();
    render(
      <TransferForm
        senderId="usr_alexander"
        senderBalance={5000}
        onSubmitTransfer={handleSubmit}
      />,
    );

    const quickPickBtn = screen.getByRole("button", { name: /Marcus Vance/i });
    fireEvent.click(quickPickBtn);

    const recipientInput = screen.getByLabelText(/Recipient ID/i);
    expect(recipientInput.value).toBe("usr_987654");
  });

  it("populates amount input when preset amount button is clicked", () => {
    const handleSubmit = vi.fn();
    render(
      <TransferForm
        senderId="usr_alexander"
        senderBalance={5000}
        onSubmitTransfer={handleSubmit}
      />,
    );

    const preset500Btn = screen.getByRole("button", { name: /\$500/i });
    fireEvent.click(preset500Btn);

    const amountInput = screen.getByLabelText(/Transfer Amount/i);
    expect(amountInput.value).toBe("500");
  });

  it("calls onSubmitTransfer with correct parameters on submit", () => {
    const handleSubmit = vi.fn();
    render(
      <TransferForm
        senderId="usr_alexander"
        senderBalance={5000}
        onSubmitTransfer={handleSubmit}
      />,
    );

    const recipientInput = screen.getByLabelText(/Recipient ID/i);
    const amountInput = screen.getByLabelText(/Transfer Amount/i);
    const submitBtn = screen.getByRole("button", { name: /Send Transfer/i });

    fireEvent.change(recipientInput, { target: { value: "usr_987654" } });
    fireEvent.change(amountInput, { target: { value: "250.00" } });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith({
      sender_id: "usr_alexander",
      receiver_id: "usr_987654",
      amount: 250,
    });
  });
});
