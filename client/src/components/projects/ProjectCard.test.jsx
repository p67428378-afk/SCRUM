import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { ProjectCard } from "./ProjectCard";
import AuthContext from "../../context/AuthContext";

const mockProject = {
  id: "proj-123",
  name: "Website Redesign",
  description: "Revamping the company website with modern UI",
  status: "In Progress",
  owner_id: "user-1",
};

const renderWithContext = (
  project,
  { isAdmin = false, onEdit, onDelete } = {},
) => {
  const authValue = {
    user: {
      id: "user-1",
      role: isAdmin ? "Admin" : "Member",
      email: "test@example.com",
    },
    isAdmin,
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <ProjectCard project={project} onEdit={onEdit} onDelete={onDelete} />
      </BrowserRouter>
    </AuthContext.Provider>,
  );
};

describe("ProjectCard Component", () => {
  it("renders project name, description and status badge", () => {
    renderWithContext(mockProject);
    expect(screen.getByText("Website Redesign")).toBeInTheDocument();
    expect(
      screen.getByText("Revamping the company website with modern UI"),
    ).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("handles edit button click", () => {
    const handleEdit = vi.fn();
    renderWithContext(mockProject, { onEdit: handleEdit });
    const editBtn = screen.getByLabelText("Edit project");
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockProject);
  });

  it("shows delete button only for Admin", () => {
    const handleDelete = vi.fn();
    const { rerender } = renderWithContext(mockProject, {
      isAdmin: false,
      onDelete: handleDelete,
    });
    expect(screen.queryByLabelText("Delete project")).not.toBeInTheDocument();

    rerender(
      <AuthContext.Provider
        value={{ user: { id: "u1", role: "Admin" }, isAdmin: true }}
      >
        <BrowserRouter>
          <ProjectCard project={mockProject} onDelete={handleDelete} />
        </BrowserRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByLabelText("Delete project")).toBeInTheDocument();
  });
});
