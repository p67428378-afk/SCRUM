import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";
import Navbar from "./components/Navbar";
import DevoteePortal from "./pages/DevoteePortal";
import PoojaCatalog from "./pages/PoojaCatalog";
import DonationModal from "./pages/DonationModal";
import { BrowserRouter } from "react-router-dom";

// Mock API module
vi.mock("./services/api", () => ({
  authAPI: {
    getMe: vi.fn().mockRejectedValue(new Error("No token")),
    login: vi.fn(),
    register: vi.fn(),
  },
  poojaAPI: {
    listPoojas: vi.fn().mockResolvedValue([
      {
        id: "p1",
        title: "Rudrabhishekam",
        description: "Sacred Shiva bathing ritual with milk and holy water",
        price: 1100,
        duration_minutes: 45,
        is_active: true,
      },
    ]),
    listSlots: vi.fn().mockResolvedValue([
      {
        id: "s1",
        pooja_id: "p1",
        slot_date: "2026-03-01",
        start_time: "07:00:00",
        end_time: "08:00:00",
        max_capacity: 10,
        booked_count: 2,
      },
    ]),
  },
  bookingAPI: {
    createBooking: vi.fn(),
    getMyBookings: vi.fn().mockResolvedValue([]),
    cancelBooking: vi.fn(),
  },
  donationAPI: {
    createDonation: vi.fn(),
    listDonations: vi.fn().mockResolvedValue([]),
    getMyDonations: vi.fn().mockResolvedValue([]),
    getReceiptUrl: vi.fn().mockReturnValue("http://localhost:8000/receipt"),
    downloadReceipt: vi.fn(),
  },
  adminAPI: {
    getDashboard: vi.fn().mockResolvedValue({
      daily_bookings_count: 5,
      total_collections: 25000,
      expected_devotees: 50,
      active_rituals: 4,
    }),
    getFinancialReport: vi.fn().mockResolvedValue({
      total_donations_amount: 15000,
      total_bookings_amount: 10000,
      total_revenue: 25000,
      donations_count: 3,
      bookings_count: 8,
      payment_methods_summary: { UPI: 20000, Cash: 5000 },
    }),
    listAnnouncements: vi.fn().mockResolvedValue([]),
    createAnnouncement: vi.fn(),
    createRitual: vi.fn(),
  },
}));

describe("Shivji Temple Management System Frontend Unit Tests", () => {
  it("renders Navbar with Temple branding", () => {
    render(
      <BrowserRouter>
        <Navbar user={null} onLogout={() => {}} />
      </BrowserRouter>,
    );
    expect(screen.getAllByText(/Shri Shivji Mandir/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/Poojas & Sevas/i)).toBeInTheDocument();
    expect(screen.getByText(/Donations & 80G/i)).toBeInTheDocument();
  });

  it("renders DevoteePortal with login form and test credentials banner", () => {
    render(<DevoteePortal user={null} onLoginSuccess={() => {}} />);
    expect(screen.getByText(/Devotee & Admin Portal/i)).toBeInTheDocument();
    expect(
      screen.getByText(/test@example.com \/ testpassword/i),
    ).toBeInTheDocument();
  });

  it("renders PoojaCatalog page header", async () => {
    render(<PoojaCatalog onSelectPoojaSlot={() => {}} />);
    expect(
      screen.getByText(/Shivji Poojas & Sacred Seva Booking/i),
    ).toBeInTheDocument();
  });

  it("renders DonationModal form and 80G tax exemption info", () => {
    render(<DonationModal />);
    expect(
      screen.getByText(/Shri Shivji Mandir Donation Portal/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/PAN Card for 80G Tax Exemption/i),
    ).toBeInTheDocument();
  });

  it("mounts full App without crashing", async () => {
    render(<App />);
    // Wait for async checkCurrentUser
    expect(await screen.findByText(/Shri Shivji Mandir/i)).toBeInTheDocument();
  });
});
