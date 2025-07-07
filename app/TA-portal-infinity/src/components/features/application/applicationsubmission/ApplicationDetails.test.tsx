import React from 'react';
import { render, screen } from '@testing-library/react';
import ApplicationDetails from './ApplicationDetails';

describe('ApplicationDetails', () => {
  const savedApp = {
    student: { studentNum: '12345' },
    preferences: ['Math', 'CS'],
    wantRemote: true,
    wantWorkingHours: 10,
    availabilities: [
      { day: 'MONDAY', startTime: '09:00', endTime: '10:00' },
      { day: 'TUESDAY', startTime: '11:00', endTime: '12:00' },
    ],
  } as any;

  it('renders application details', () => {
    render(<ApplicationDetails savedApp={savedApp} />);
    expect(screen.getByText(/Student ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/Preferences:/i)).toBeInTheDocument();
    expect(screen.getByText(/Remote:/i)).toBeInTheDocument();
    expect(screen.getByText(/Requested Hours:/i)).toBeInTheDocument();
    expect(screen.getByText(/Availability:/i)).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('Math, CS')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('MONDAY 09:00–10:00')).toBeInTheDocument();
    expect(screen.getByText('TUESDAY 11:00–12:00')).toBeInTheDocument();
  });
});
