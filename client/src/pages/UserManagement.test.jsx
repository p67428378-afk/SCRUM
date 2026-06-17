import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserManagement from './UserManagement';

// Mock the API calls
vi.mock('../services/api', () => ({
  getDashboardUsers: vi.fn(() => Promise.resolve({ users: [], total: 0 })),
  getRoles: vi.fn(() => Promise.resolve([])),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deactivateUser: vi.fn(),
  assignUserRoles: vi.fn(),
}));

describe('UserManagement Component', () => {
  it('renders user management page and search input', () => {
    render(<UserManagement />);
    expect(screen.getByPlaceholderText('Search employees...')).toBeInTheDocument();
    expect(screen.getByText('Add New User')).toBeInTheDocument();
  });
});
