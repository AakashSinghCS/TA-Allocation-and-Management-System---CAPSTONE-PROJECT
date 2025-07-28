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
  };

  it('renders all steps', () => {
    render(<ApplicationSidebar {...baseProps} />);
    expect(screen.getByText(/Application Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Terms Selected/i)).toBeInTheDocument();
  });
});
