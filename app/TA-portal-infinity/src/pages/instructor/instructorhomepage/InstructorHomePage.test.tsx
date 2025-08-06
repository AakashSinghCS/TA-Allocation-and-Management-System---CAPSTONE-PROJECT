import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import InstructorHomePage from './InstructorHomePage';

// Mock AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ userId: 123, token: 'fake-token' }),
}));

// Mock all API calls
vi.mock('../../../api/semester/getAllSemesters', () => ({
  getAllSemesters: vi.fn(() => Promise.resolve([{
    id: 1,
    year: 2025,
    semester: 'W1',
    startDate: '2024-12-01',
    endDate: '2025-04-30',
    isActive: true
  }])),
}));

vi.mock('../../../api/allocation/fetchAllocationById', () => ({
  fetchAllocationById: vi.fn(() => Promise.resolve({
    id: 1,
    status: 'CONFIRMED'
  })),
}));

vi.mock('../../../api/instructor/fetchSectionNeedAndAllocations', () => ({
  fetchSectionNeedAndAllocations: vi.fn(() => Promise.resolve([
    {
      id: 1,
      course: { id: 1, deptCode: 'COSC', courseNum: '101', name: 'Intro to CS' },
      section: '001',
      year: 2025,
      semester: 'W1',
      type: 'LECTURE',
      need: { id: 1, description: 'TA assistance needed' },
      allocatedSections: [],
      allocations: []
    },
    {
      id: 2,
      course: { id: 2, deptCode: 'MATH', courseNum: '200', name: 'Calculus' },
      section: '002',
      year: 2025,
      semester: 'W1',
      type: 'TUTORIAL',
      allocatedSections: [],
      allocations: []
    }
  ])),
}));

vi.mock('../../../api/instructor/fetchAllInstructorQualifications', () => ({
  fetchAllInstructorQualifications: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../../../api/instructor/fetchInstructorDetails', () => ({
  fetchInstructorDetails: vi.fn(() => Promise.resolve({
    firstName: 'John',
    lastName: 'Smith'
  })),
}));

vi.mock('../../../api/config/fetchDeadlines', () => ({
  fetchDeadlines: vi.fn(() => Promise.resolve([{
    name: 'instructor_need_update_deadline',
    startTime: '2025-01-01T00:00:00Z',
    endTime: '2025-01-31T23:59:59Z'
  }])),
}));

vi.mock('../../../api/course/sectionfilter/fetchAllExistingYears', () => ({
  fetchAllExistingYears: vi.fn(() => Promise.resolve([2025])),
}));

// Mock child components
vi.mock('../../../components/features/instructor_home/DeadlineTracker', () => ({
  DeadlineTracker: () => <div data-testid="deadline-tracker">DeadlineTracker</div>
}));

vi.mock('../../../components/features/instructor_home/CoursesTeachingCard', () => ({
  CoursesTeachingCard: () => <div data-testid="courses-teaching-card">CoursesTeachingCard</div>
}));

vi.mock('../../../components/features/instructor_home/TAAllocationsCard', () => ({
  TAAllocationsCard: () => <div data-testid="ta-allocations-card">TAAllocationsCard</div>
}));

vi.mock('../../../components/features/instructor_home/CoursesMissingNeedsCard', () => ({
  CoursesMissingNeedsCard: () => <div data-testid="courses-missing-needs-card">CoursesMissingNeedsCard</div>
}));

vi.mock('../../../components/features/instructor_home/CoursesMissingQualificationsCard', () => ({
  CoursesMissingQualificationsCard: () => <div data-testid="courses-missing-qualifications-card">CoursesMissingQualificationsCard</div>
}));

describe('InstructorHomePage', () => {
  it('renders loading initially', () => {
    render(<InstructorHomePage />);
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();
  });

  it('renders dashboard title after loading', async () => {
    render(<InstructorHomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    });
  });

  it('renders welcome message with instructor name', async () => {
    render(<InstructorHomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome/)).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  it('renders all dashboard cards', async () => {
    render(<InstructorHomePage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('courses-teaching-card')).toBeInTheDocument();
      expect(screen.getByTestId('ta-allocations-card')).toBeInTheDocument();
      expect(screen.getByTestId('courses-missing-needs-card')).toBeInTheDocument();
      expect(screen.getByTestId('courses-missing-qualifications-card')).toBeInTheDocument();
      expect(screen.getByTestId('deadline-tracker')).toBeInTheDocument();
    });
  });

  it('displays metrics for sections teaching', async () => {
    render(<InstructorHomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Sections Teaching')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('displays confirmed allocations count', async () => {
    render(<InstructorHomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Confirmed Allocations')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  it('displays missing needs count', async () => {
    render(<InstructorHomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Missing Needs')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('handles instructor profile link correctly', async () => {
    render(<InstructorHomePage />);
    
    await waitFor(() => {
      const profileLink = screen.getByRole('link', { name: 'John Smith' });
      expect(profileLink).toHaveAttribute('href', 'http://localhost:5173/user/profile/123');
      expect(profileLink).toHaveAttribute('target', '_blank');
      expect(profileLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('applies correct CSS classes to main container', async () => {
    render(<InstructorHomePage />);
    
    await waitFor(() => {
      const section = screen.getByText('My Dashboard').closest('section');
      expect(section).toHaveClass('px-2', 'sm:px-4', 'py-4', 'sm:py-6', 'bg-white', 'min-h-full');
    });
  });
});
