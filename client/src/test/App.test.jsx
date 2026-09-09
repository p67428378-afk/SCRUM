import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import App from "../App";
import HeaderNav from "../components/common/HeaderNav";
import HeroBio from "../components/home/HeroBio";
import FilmographyTable from "../components/credits/FilmographyTable";
import ContactBookingForm from "../components/contact/ContactBookingForm";
import { BrowserRouter } from "react-router-dom";

describe("Actress Portfolio Website Unit Tests", () => {
  it("renders the main App without crashing and displays Elena Vance brand", () => {
    render(<App />);
    const brandElements = screen.getAllByText(/ELENA VANCE/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it("renders HeaderNav with navigation anchors and CTA", () => {
    render(
      <BrowserRouter>
        <HeaderNav />
      </BrowserRouter>,
    );
    expect(screen.getByText(/Home & Bio/i)).toBeInTheDocument();
    expect(screen.getByText(/Media Gallery/i)).toBeInTheDocument();
    expect(screen.getByText(/Filmography/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Contact Agent/i).length).toBeGreaterThan(0);
  });

  it("renders HeroBio with key metrics and Press Kit CTA", () => {
    render(<HeroBio />);
    expect(screen.getByText(/Juilliard School Alumna/i)).toBeInTheDocument();
    expect(screen.getByText(/Acting Credits/i)).toBeInTheDocument();
    expect(screen.getByText(/Award Nominations/i)).toBeInTheDocument();
    expect(screen.getByText(/Download Press Kit/i)).toBeInTheDocument();
  });

  it("renders FilmographyTable and filters by category", async () => {
    render(<FilmographyTable />);
    expect(screen.getByText(/Television/i)).toBeInTheDocument();
    expect(screen.getByText(/Film/i)).toBeInTheDocument();

    const tvButton = screen.getByRole("button", { name: /^Television$/i });
    fireEvent.click(tvButton);

    await waitFor(() => {
      expect(screen.getByText(/City Lights \(HBO\)/i)).toBeInTheDocument();
    });
  });

  it("renders ContactBookingForm with required inputs and test account note", () => {
    render(<ContactBookingForm />);
    expect(
      screen.getByPlaceholderText(/Sender Full Name/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/test@example.com/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Booking Inquiry/i }),
    ).toBeInTheDocument();
  });
});
