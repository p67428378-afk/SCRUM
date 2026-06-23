import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProfileSettingsPage from "./ProfileSettingsPage";
import { profileService } from "../services/api";

// Mock the profileService
vi.mock("../services/api", () => ({
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

describe("ProfileSettingsPage Component", () => {
  it("renders profile details correctly", async () => {
    const mockProfile = {
      student_id: "123e4567-e89b-12d3-a456-426614174000",
      first_name: "Alex",
      last_name: "Rivera",
      preferred_name: "Alex",
      email: "alex@apex.edu",
      phone_number: "+1 (555) 019-2834",
      profile_picture_url: "",
    };

    profileService.getProfile.mockResolvedValue(mockProfile);

    render(<ProfileSettingsPage onProfileUpdate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Preferred Name")).toHaveValue("Alex");
    });

    expect(screen.getByText("alex@apex.edu")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toHaveValue(
      "+1 (555) 019-2834",
    );
  });
});
