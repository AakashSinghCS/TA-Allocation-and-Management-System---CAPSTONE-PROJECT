import React from 'react';
import { render, screen } from '@testing-library/react';
import ApplicationSidebar from './ApplicationSidebar';

describe('ApplicationSidebar', () => {
  const baseProps = {
    formData: {
      firstPreference: 'Math',
      secondPreference: 'CS',
      thirdPreference: 'Physics',
      wantWorkingHours: '10',
      wantRemote: 'yes',
      transcriptFile: { name: 'file.pdf' },
      confirmProfileUpdated: true,
      applicationType: 'UNDERGRADUATE',
    },
    unavailability: [{ id: '1', day: 'MONDAY', startTime: '09:00', endTime: '10:00' }],
    submitted: true,
    errors: {},
  };

  it('renders all steps', () => {
    render(<ApplicationSidebar {...baseProps} />);
    expect(screen.getByText(/Select Preferences/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Working Hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Transcript/i)).toBeInTheDocument();
    expect(screen.getByText(/Application Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Remote Preference/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Unavailability/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm Profile Update/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit Application/i)).toBeInTheDocument();
  });
});
