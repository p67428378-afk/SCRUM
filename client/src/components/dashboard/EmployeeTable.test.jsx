import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeTable from './EmployeeTable';

describe('EmployeeTable Component', () => {
  const mockUsers = [
    {
      id: '1',
      employee_id: 'EMP001',
      first_name: 'Alice',
      last_name: 'Johnson',
      email: 'alice@example.com',
      status: 'ACTIVE',
      roles: ['Teller'],
    },
  ];

  it('renders table headers and user data', () => {
    render(
      <EmployeeTable
        users={mockUsers}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
        onActivate={vi.fn()}
        onAssignRoles={vi.fn()}
      />
    );

    expect(screen.getByText('Employee ID')).toBeInTheDocument();
    expect(screen.getByText('EMP001')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders empty state when no users are provided', () => {
    render(
      <EmployeeTable
        users={[]}
        onEdit={vi.fn()}
        onDeactivate={vi.fn()}
        onActivate={vi.fn()}
        onAssignRoles={vi.fn()}
      />
    );

    expect(screen.getByText('No employees found.')).toBeInTheDocument();
  });
});
