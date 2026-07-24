import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import OtpInput from "./OtpInput";

describe("OtpInput Component", () => {
  it("renders correct number of inputs", () => {
    render(<OtpInput value="" onChange={() => {}} length={6} />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(6);
  });

  it("calls onChange when typing", () => {
    const handleChange = vi.fn();
    render(<OtpInput value="" onChange={handleChange} length={6} />);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "5" } });
    expect(handleChange).toHaveBeenCalledWith("5");
  });
});
