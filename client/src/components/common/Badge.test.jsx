import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from './Badge';

describe('Badge Component', () => {
  it('renders status text correctly', () => {
    render(<Badge status="APPROVED" />);
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('applies correct classes for APPROVED status', () => {
    render(<Badge status="APPROVED" />);
    const badge = screen.getByText('APPROVED');
    expect(badge).toHaveClass('text-green-500');
  });

  it('applies correct classes for FLAGGED status', () => {
    render(<Badge status="FLAGGED" />);
    const badge = screen.getByText('FLAGGED');
    expect(badge).toHaveClass('text-red-500');
  });
});