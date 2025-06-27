import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TAAllocationPage from './AllocationPage';
import { AuthContext } from '../../context/AuthContext';
import { UserRole } from '../../interfaces/enum/UserRole';
import { mockSectionCOSC111 } from '../../mocked-objects/section/mockSectionCOSC111';
import { mockSectionMATH125 } from '../../mocked-objects/section/mockSectionMATH125';

// Mock functions
const mockFetchApplications = vi.fn();
const mockFetchSection = vi.fn();

// Mock data
const mockApps = [
  {
    studentId: 1,
    preferences: [mockSectionCOSC111.sectionDetails?.deptCode || 'COSC'],
    wantRemote: true,
    wantWorkingHours: 6,
    timeSubmitted: '2025-06-25T12:00:00.000Z',
    availabilities: [
      { day: mockSectionCOSC111.sectionSchedule?.[0]?.day || 'MONDAY', startTime: '09:00', endTime: '11:00' },
    ],
  },
  {
    studentId: 2,
    preferences: [mockSectionMATH125.sectionDetails?.deptCode || 'MATH'],
    wantRemote: false,
    wantWorkingHours: 4,
    timeSubmitted: '2025-06-25T13:00:00.000Z',
    availabilities: [],
  },
];

const mockAuthContext = {
  token: 'test-token-123',
  userId: 1,
  userRoles: [UserRole.COORDINATOR],
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
};

// Mock modules
vi.mock('../../api/application/FetchApplications', () => ({
  fetchApplications: mockFetchApplications,
}));
vi.mock('../../api/section/fetchSection', () => ({
  fetchSection: mockFetchSection,
}));

describe('TAAllocationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchApplications.mockResolvedValue(mockApps);
    mockFetchSection.mockResolvedValue({
      sectionDetails: mockSectionCOSC111.sectionDetails,
      sectionSchedule: mockSectionCOSC111.sectionSchedule,
      need: mockSectionCOSC111.need,
      allocations: [],
      hasCompleted: false,
    });
  });

  const renderWithAuth = () =>
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <TAAllocationPage />
      </AuthContext.Provider>
    );

  it('renders the main heading and course list', async () => {
    renderWithAuth();
    expect(screen.getByText(/Please select a course/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetchApplications).toHaveBeenCalledWith(mockAuthContext.userId, mockAuthContext.token);
      expect(screen.getByText(/COSC 111/i)).toBeInTheDocument();
      expect(screen.getByText(/MATH 125/i)).toBeInTheDocument();
    });
  });

  it('filters courses based on search input', async () => {
    renderWithAuth();
    await waitFor(() => expect(mockFetchApplications).toHaveBeenCalled());

    const searchInput = screen.getByPlaceholderText('Search…');
    fireEvent.change(searchInput, { target: { value: 'MATH' } });

    await waitFor(() => {
      expect(screen.getByText(/MATH 125/i)).toBeInTheDocument();
      expect(screen.queryByText(/COSC 111/i)).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: 'COSC' } });
    await waitFor(() => {
      expect(screen.getByText(/COSC 111/i)).toBeInTheDocument();
      expect(screen.queryByText(/MATH 125/i)).not.toBeInTheDocument();
    });
  });

  it('loads and displays grading need when a course is selected', async () => {
    renderWithAuth();
    await waitFor(() => expect(screen.getByText(/COSC 111/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/COSC 111/i));
    await waitFor(() => {
      expect(mockFetchSection).toHaveBeenCalled();
      expect(screen.getByText(/Grading Need/i)).toBeInTheDocument();
      expect(screen.getByText(/Description:/i)).toBeInTheDocument();
    });
  });

  it('renders the calendar panel', async () => {
    renderWithAuth();
    expect(screen.getByText(/Weekly Calendar/i)).toBeInTheDocument();
    // Optionally, check for calendar legend
    expect(screen.getByText(/Course Slot/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Availability/i)).toBeInTheDocument();
  });
});