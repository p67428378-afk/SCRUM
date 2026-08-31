import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import AuthContext from "../context/AuthContext";

describe("LoginPage Component", () => {
  const renderLoginPage = () => {
    const authValue = {
      user: null,
      token: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
    };

    return render(
      <AuthContext.Provider value={authValue}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthContext.Provider>,
    );
  };

  it("renders login form with title and pre-filled credentials", () => {
    renderLoginPage();
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@example.com")).toHaveValue(
      "test@example.com",
    );
    expect(screen.getByPlaceholderText("••••••••")).toHaveValue("testpassword");
  });

  it("displays test account notification for QA and demo access", () => {
    renderLoginPage();
    expect(
      screen.getByText(/Test account: test@example.com \/ testpassword/i),
    ).toBeInTheDocument();
  });
});
