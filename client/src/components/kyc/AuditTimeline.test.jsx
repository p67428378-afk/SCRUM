import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AuditTimeline from './AuditTimeline';

describe('AuditTimeline Component', () => {
  const mockLogs = [
    {
      id: '1',
      action: 'Aadhaar Verification',
      details: 'Aadhaar verified successfully via UIDAI API',
      timestamp: '2026-06-16T10:30:00.000Z',
    },
    {
      id: '2',
      action: 'PAN Verification',
      details: 'PAN verified successfully via NSDL API',
      timestamp: '2026-06-16T10:31:00.000Z',
    },
  ];

  it('renders audit logs correctly', () => {
    render(<AuditTimeline logs={mockLogs} />);
    
    expect(screen.getByText('Aadhaar Verification')).toBeInTheDocument();
    expect(screen.getByText('Aadhaar verified successfully via UIDAI API')).toBeInTheDocument();
    
    expect(screen.getByText('PAN Verification')).toBeInTheDocument();
    expect(screen.getByText('PAN verified successfully via NSDL API')).toBeInTheDocument();
  });

  it('renders empty state when no logs are provided', () => {
    render(<AuditTimeline logs={[]} />);
    expect(screen.getByText('No audit logs available.')).toBeInTheDocument();
  });
});