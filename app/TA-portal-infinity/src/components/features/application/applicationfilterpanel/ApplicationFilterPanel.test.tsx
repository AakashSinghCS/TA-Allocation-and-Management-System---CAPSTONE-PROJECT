import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAllocationsByStudent } from '../../../../api/allocation/fetchAllocationByStudent';
import { useAuth } from '../../../../context/AuthContext';
import type { ApplicationDto, Day } from '../../../../interfaces/application/Application';
import ApplicationFilterPanel from './ApplicationFilterPanel';
// Mock the dependencies
vi.mock('../../../../context/AuthContext');
vi.mock('../../../../api/allocation/fetchAllocationByStudent');

const mockUseAuth = vi.mocked(useAuth);
const mockFetchAllocationsByStudent = vi.mocked(fetchAllocationsByStudent);

// Simple mock data
const mockApplications: ApplicationDto[] = [
  {
    student: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      studentNum: '123456',
      program: 'BSc Computer Science',
      enrollmentYear: 2022,
      schoolYear: '2nd',
    },
    applicationType: 'UNDERGRADUATE',
    preferences: ['Computer Science'],
    wantRemote: true,
    wantWorkingHours: 20,
    timeSubmitted: '2024-01-15T10:00:00Z',
    availabilities: [
      { day: 'Monday' as Day, startTime: '09:00', endTime: '17:00' },
    ],
  }
];

describe('ApplicationFilterPanel', () => {
  const defaultProps = {
    appQ: {
      pref1: '',
      pref2: '',
      wantRemote: '',
      wantHours: '',
      studentName: '',
      studentNum: '',
    },
    setAppQ: vi.fn(),
    allApps: mockApplications,
    selApp: null,
    loadApp: vi.fn(),
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
      userRoles: [],
      userId: 1,
    });
    mockFetchAllocationsByStudent.mockResolvedValue([]);
    vi.clearAllMocks();
  });

  it('renders the component', () => {
    render(<ApplicationFilterPanel {...defaultProps} />);
    expect(screen.getByText('Application Filter')).toBeInTheDocument();
  });

  it('renders filter controls', () => {
    render(<ApplicationFilterPanel {...defaultProps} />);
    expect(screen.getByPlaceholderText('Student Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
  });

  it('shows filtered applications after clicking filter', () => {
    render(<ApplicationFilterPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    // Use regex to match 'John Doe' even if it's split
    expect(screen.getByText(/John\sDoe/)).toBeInTheDocument();
  });

  it('calls loadApp when application is clicked', () => {
    const loadApp = vi.fn();
    render(<ApplicationFilterPanel {...defaultProps} loadApp={loadApp} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    // Use regex to match 'John Doe' even if it's split
    fireEvent.click(screen.getByText(/John\sDoe/));
    
    expect(loadApp).toHaveBeenCalledWith(mockApplications[0]);
  });

  it('displays selected application details', () => {
    const propsWithSelection = {
      ...defaultProps,
      selApp: mockApplications[0],
    };

    render(<ApplicationFilterPanel {...propsWithSelection} />);
    
    expect(screen.getByText('Applicant Details')).toBeInTheDocument();
    // Use regex to match 'John Doe' even if it's split
    expect(screen.getByText(/John\sDoe/)).toBeInTheDocument();
  });
});
