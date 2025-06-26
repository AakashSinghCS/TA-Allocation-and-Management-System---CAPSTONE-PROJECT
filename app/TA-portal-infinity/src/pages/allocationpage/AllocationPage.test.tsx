import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TAAllocationPage from './AllocationPage';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { UserRole } from '../../interfaces/enum/UserRole';
import type { ApplicationDto } from '../../interfaces/application/Application';
import type { Applicant } from '../../interfaces/applicant/Applicant';

// Mock FullCalendar
vi.mock('@fullcalendar/react', () => ({
  default: ({ events }: { events: any[] }) => (
    <div data-testid="fullcalendar" data-events={JSON.stringify(events)}>
      Mock Calendar
    </div>
  ),
}));

// Mock API functions
vi.mock('../../api/application/FetchApplications', () => ({
  fetchApplications: vi.fn(),
}));

vi.mock('../../api/application/FetchApplicants', () => ({
  fetchApplicants: vi.fn(),
}));

vi.mock('../../api/section/fetchSection', () => ({
  fetchSection: vi.fn(),
}));

// Mock utility functions
vi.mock('../../utility/calendar/calendarUtils', () => ({
  getDayNumber: vi.fn((day: string) => {
    const dayMap: Record<string, number> = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 0,
    };
    return dayMap[day] || 1;
  }),
}));

// Mock data
const mockApplications: ApplicationDto[] = [
  {
    studentId: 123,
    preferences: ['COSC111', 'COSC121'],
    wantRemote: true,
    wantWorkingHours: 10,
    timeSubmitted: '2024-01-15T10:00:00Z',
    availabilities: [
      { day: 'MONDAY', startTime: '09:00', endTime: '11:00' },
      { day: 'WEDNESDAY', startTime: '14:00', endTime: '16:00' },
    ],
  },
  {
    studentId: 456,
    preferences: ['MATH125', 'COSC111'],
    wantRemote: false,
    wantWorkingHours: 15,
    timeSubmitted: '2024-01-16T14:30:00Z',
    availabilities: [
      { day: 'TUESDAY', startTime: '10:00', endTime: '12:00' },
      { day: 'THURSDAY', startTime: '13:00', endTime: '15:00' },
    ],
  },
];

const mockApplicants: Applicant[] = [
  {
    studentId: 123,
    firstName: 'Alice',
    lastName: 'Smith',
    availability: [
      JSON.stringify({ day: 'MONDAY', startTime: '09:00', endTime: '11:00' }),
      JSON.stringify({ day: 'WEDNESDAY', startTime: '14:00', endTime: '16:00' }),
    ],
    completedCourses: ['COSC111', 'COSC121'],
    requestedHours: 10,
  },
  {
    studentId: 456,
    firstName: 'Bob',
    lastName: 'Johnson',
    availability: [
      JSON.stringify({ day: 'TUESDAY', startTime: '10:00', endTime: '12:00' }),
      JSON.stringify({ day: 'THURSDAY', startTime: '13:00', endTime: '15:00' }),
    ],
    completedCourses: ['MATH125', 'COSC111'],
    requestedHours: 15,
  },
];

import type { SectionType } from '../../interfaces/section/SectionDetails';
const mockSectionData = {
  sectionDetails: {
    sectionId: 1,
    deptCode: 'COSC',
    courseNum: '111',
    name: 'Computer Programming I',
    section: 'A01',
    term: '2024W1',
    type: 'Lecture' as SectionType,
  },
  sectionSchedule: [
    { day: 'Monday', startTime: '10:00', endTime: '11:00' },
    { day: 'Wednesday', startTime: '10:00', endTime: '11:00' },
  ],
  need: {
    description: 'Grading assignments and labs',
    numOfHoursCurrentlyAllocated: 5,
    requiredGradingHours: 10,
    courseNeeds: [{ deptCode: 'COSC', courseNum: '110' }],
  },
};

const mockContext = {
  token: 'test-token',
  userId: 123,
  userRoles: [UserRole.COORDINATOR],
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
};

const renderWithProviders = () =>
  render(
    <AuthContext.Provider value={mockContext}>
      <MemoryRouter>
        <TAAllocationPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

import { fetchApplications } from '../../api/application/FetchApplications';
import { fetchApplicants } from '../../api/application/FetchApplicants';
import { fetchSection } from '../../api/section/fetchSection';

describe('TAAllocationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    vi.mocked(fetchApplications).mockResolvedValue(mockApplications);
    vi.mocked(fetchApplicants).mockResolvedValue(mockApplicants);
    vi.mocked(fetchSection).mockResolvedValue(mockSectionData);
  });

  it('renders the main heading', async () => {
    renderWithProviders();
    expect(screen.getByText('TA Allocations')).toBeInTheDocument();
  });

  it('renders course filter section', async () => {
    renderWithProviders();
    expect(screen.getByText('Course Filter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
    expect(screen.getByText('Please select a course*')).toBeInTheDocument();
  });

  it('renders application filter section', async () => {
    renderWithProviders();
    expect(screen.getByText('Application Filter')).toBeInTheDocument();
    expect(screen.getByText('Please select a Applicant*')).toBeInTheDocument();
  });

  it('renders calendar section', async () => {
    renderWithProviders();
    expect(screen.getByText('Weekly Calendar')).toBeInTheDocument();
    expect(screen.getByTestId('fullcalendar')).toBeInTheDocument();
  });

  it('displays mock course sections', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText(/COSC 111 • A01 • 2024W1/)).toBeInTheDocument();
      expect(screen.getByText(/COSC 121 • A01 • 2024W1/)).toBeInTheDocument();
      expect(screen.getByText(/MATH 125 • A01 • 2024W1/)).toBeInTheDocument();
    });
  });

  it('filters courses by search text', async () => {
    renderWithProviders();
    
    const searchInput = screen.getByPlaceholderText('Search…');
    fireEvent.change(searchInput, { target: { value: 'COSC' } });
    
    await waitFor(() => {
      expect(screen.getByText(/COSC 111 • A01 • 2024W1/)).toBeInTheDocument();
      expect(screen.getByText(/COSC 121 • A01 • 2024W1/)).toBeInTheDocument();
      expect(screen.queryByText(/MATH 125 • A01 • 2024W1/)).not.toBeInTheDocument();
    });
  });

  it('filters courses by department', async () => {
    renderWithProviders();
    
    const deptSelect = screen.getByDisplayValue('Dept');
    fireEvent.change(deptSelect, { target: { value: 'MATH' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/COSC 111 • A01 • 2024W1/)).not.toBeInTheDocument();
      expect(screen.queryByText(/COSC 121 • A01 • 2024W1/)).not.toBeInTheDocument();
      expect(screen.getByText(/MATH 125 • A01 • 2024W1/)).toBeInTheDocument();
    });
  });

  it('loads and displays course details when a course is selected', async () => {
    renderWithProviders();
    
    const courseButton = await screen.findByText(/COSC 111 • A01 • 2024W1/);
    fireEvent.click(courseButton);
    
    await waitFor(() => {
      expect(screen.getByText('Grading Need')).toBeInTheDocument();
      expect(screen.getByText('Grading assignments and labs')).toBeInTheDocument();
      expect(screen.getByText('Allocated Hours: 5')).toBeInTheDocument();
      expect(screen.getByText('Required Hours: 10')).toBeInTheDocument();
    });
  });

  it('displays applications when fetched', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText(/Student #123/)).toBeInTheDocument();
      expect(screen.getByText(/Student #456/)).toBeInTheDocument();
    });
  });

  it('filters applications by preferences', async () => {
    renderWithProviders();
    
    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText(/Student #123/)).toBeInTheDocument();
    });
    
    const pref1Select = screen.getByDisplayValue('1st Pref');
    fireEvent.change(pref1Select, { target: { value: 'MATH125' } });
    
    await waitFor(() => {
      expect(screen.queryByText(/Student #123/)).not.toBeInTheDocument();
      expect(screen.getByText(/Student #456/)).toBeInTheDocument();
    });
  });

  it('displays application details when an application is selected', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      const appButton = screen.getByText(/Student #123/);
      fireEvent.click(appButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Application Details')).toBeInTheDocument();
      expect(screen.getByText('COSC111, COSC121')).toBeInTheDocument();
      expect(screen.getByText('Remote: Yes')).toBeInTheDocument();
      expect(screen.getByText('Hours: 10')).toBeInTheDocument();
    });
  });

  it('shows calendar events when course and application are selected', async () => {
    renderWithProviders();
    
    // Select a course
    const courseButton = await screen.findByText(/COSC 111 • A01 • 2024W1/);
    fireEvent.click(courseButton);
    
    // Select an application
    await waitFor(() => {
      const appButton = screen.getByText(/Student #123/);
      fireEvent.click(appButton);
    });
    
    await waitFor(() => {
      const calendar = screen.getByTestId('fullcalendar');
      const eventsData = JSON.parse(calendar.getAttribute('data-events') || '[]');
      expect(eventsData.length).toBeGreaterThan(0);
    });
  });

  it('displays remaining hours status', async () => {
    renderWithProviders();
    
    // Select a course
    const courseButton = await screen.findByText(/COSC 111 • A01 • 2024W1/);
    fireEvent.click(courseButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Remaining Hours:/)).toBeInTheDocument();
      expect(screen.getByText(/5 needed \(Allocated: 5, Required: 10\)/)).toBeInTheDocument();
    });
  });

  it('displays schedule conflict status', async () => {
    renderWithProviders();
    
    // Select a course
    const courseButton = await screen.findByText(/COSC 111 • A01 • 2024W1/);
    fireEvent.click(courseButton);
    
    // Select an application
    await waitFor(() => {
      const appButton = screen.getByText(/Student #123/);
      fireEvent.click(appButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Schedule Conflict:/)).toBeInTheDocument();
    });
  });

  it('enables send offer button when both course and application are selected', async () => {
    renderWithProviders();
    
    const sendOfferBtn = screen.getByText('Send Offer');
    expect(sendOfferBtn).toBeDisabled();
    
    // Select a course
    const courseButton = await screen.findByText(/COSC 111 • A01 • 2024W1/);
    fireEvent.click(courseButton);
    
    // Select an application
    await waitFor(() => {
      const appButton = screen.getByText(/Student #123/);
      fireEvent.click(appButton);
    });
    
    await waitFor(() => {
      expect(sendOfferBtn).not.toBeDisabled();
    });
  });

  it('shows calendar legend', async () => {
    renderWithProviders();
    
    expect(screen.getByText('Course Slot')).toBeInTheDocument();
    expect(screen.getByText('Student Availability')).toBeInTheDocument();
    expect(screen.getByText('Conflict')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(fetchApplications).mockRejectedValue(new Error('API Error'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProviders();
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('shows no applications message when no applications match filters', async () => {
    renderWithProviders();
    
    // Apply a filter that matches no applications
    await waitFor(() => {
      const pref1Select = screen.getByDisplayValue('1st Pref');
      fireEvent.change(pref1Select, { target: { value: 'NONEXISTENT' } });
    });
    
    await waitFor(() => {
      expect(screen.getByText('No applications')).toBeInTheDocument();
    });
  });

  it('shows no courses message when no courses match filters', async () => {
    renderWithProviders();
    
    const searchInput = screen.getByPlaceholderText('Search…');
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });
    
    await waitFor(() => {
      expect(screen.getByText('No courses')).toBeInTheDocument();
    });
  });

  it('clears application selection when a new course is selected', async () => {
    renderWithProviders();
    
    // Select an application first
    await waitFor(() => {
      const appButton = screen.getByText(/Student #123/);
      fireEvent.click(appButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Application Details')).toBeInTheDocument();
    });
    
    // Select a course
    const courseButton = await screen.findByText(/COSC 111 • A01 • 2024W1/);
    fireEvent.click(courseButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Application Details')).not.toBeInTheDocument();
    });
  });
});