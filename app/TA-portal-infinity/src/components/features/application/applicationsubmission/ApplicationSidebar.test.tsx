import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ApplicationSidebar from './ApplicationSidebar';

describe('ApplicationSidebar', () => {
  const baseProps = {
    selectedTerms: ['2025-Summer'],
    getTermFormData: vi.fn(() => ({
      firstPreference: 'Math',
      secondPreference: 'CS',
      thirdPreference: 'Physics',
      wantWorkingHours: '10',
      wantRemote: 'yes',
      transcriptFile: { name: 'file.pdf' },
      confirmProfileUpdated: true,
      applicationType: 'UNDERGRADUATE',
    })),
      unavailability: [{ id: '1', day: 'MONDAY', startTime: '09:00', endTime: '10:00' }],
      submitted: true,
      errors: {},
  };

  it('renders all steps', () => {
    render(<ApplicationSidebar {...baseProps} />);
    expect(screen.getByText(/Application Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms Selected:/i)).toBeInTheDocument();
    expect(screen.getByText(/All selected term applications are complete!/i)).toBeInTheDocument();
    expect(screen.getByText(/view your submitted TA applications/i)).toBeInTheDocument();
  });
});
