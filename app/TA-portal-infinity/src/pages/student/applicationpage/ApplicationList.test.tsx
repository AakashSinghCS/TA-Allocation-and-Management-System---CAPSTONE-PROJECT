
import { describe, it, expect, vi } from 'vitest';
import type { ApplicationType } from '../../../interfaces/enum/ApplicationType';
import { render, screen, fireEvent } from '@testing-library/react';
import ApplicationList from './ApplicationList';

const mockApplications = [
  {
    id: 1,
    applicationId: 1,
    year: 2025,
    semester: 'Summer',
    timeSubmitted: new Date().toISOString(),
    preferences: ['A', 'B', 'C'],
    wantWorkingHours: 10,
    wantRemote: true,
    applicationType: 'UNDERGRADUATE' as ApplicationType,
    availabilities: [],
    student: {
      id: 1,
      firstName: 'Test',
      lastName: 'Student',
      studentNum: 'S12345678',
      program: 'COSC',
      enrollmentYear: 2022,
      schoolYear: '3',
    },
  },
];

describe('ApplicationList', () => {
  const defaultProps = {
    existingApplications: mockApplications,
    expandedAppId: null,
    setExpandedAppId: vi.fn(),
    setSavedApp: vi.fn(),
    userId: 1,
    token: 'token',
    userRoles: ['STUDENT'],
    fetchApplicationsByStudent: vi.fn(),
    setExistingApplications: vi.fn(),
    setExistingTerms: vi.fn(),
    setSubmitted: vi.fn(),
    clearForm: vi.fn(),
  };

  it('renders application details', () => {
    render(<ApplicationList {...defaultProps} />);
    expect(screen.getByText(/Application ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/2025 Summer/i)).toBeInTheDocument();
    // Check for status specifically - use getAllByText and verify count
    const submittedElements = screen.getAllByText(/Submitted/i);
    expect(submittedElements.length).toBeGreaterThan(0);
  });

  it('calls setExpandedAppId and setSavedApp on view button click', () => {
    render(<ApplicationList {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /View Application/i }));
    expect(defaultProps.setExpandedAppId).toHaveBeenCalled();
    expect(defaultProps.setSavedApp).toHaveBeenCalled();
  });
});
