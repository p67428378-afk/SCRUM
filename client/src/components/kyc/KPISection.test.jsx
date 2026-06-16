import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPISection from './KPISection';

describe('KPISection Component', () => {
  const mockStats = {
    total: 1248,
    approved: 984,
    flagged: 182,
    pending: 82,
  };

  it('renders all KPI cards with correct values', () => {
    render(<KPISection stats={mockStats} />);
    
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('1,248')).toBeInTheDocument();
    
    expect(screen.getByText('Approved KYC')).toBeInTheDocument();
    expect(screen.getByText('984')).toBeInTheDocument();
    
    expect(screen.getByText('Flagged Risks')).toBeInTheDocument();
    expect(screen.getByText('182')).toBeInTheDocument();
    
    expect(screen.getByText('Pending Verif.')).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
  });
});