import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InstructorNeedPage from './InstructorNeedPage';

// Mock dependencies
vi.mock('../../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ render: renderProp }: any) => {
    const mockUserData = {
      id: 123,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      roles: ['INSTRUCTOR']
    };
    
    const mockNeedData = {
      sections: [
        {
          id: 1,
          sectionId: 'L01',
          semester: 'Fall',
          year: 2024,
          course: {
            id: 1,
            deptCode: 'COSC',
            courseNum: '499',
            name: 'Capstone Project'
          }
        }
      ],
      existingYears: ['2024', '2023'],
      allAssignedCourses: [
        {
          id: 1,
          deptCode: 'COSC',
          courseNum: '499',
          name: 'Capstone Project'
        }
      ]
    };
    
    return renderProp === renderProp.toString().includes('TabNav') 
      ? renderProp(mockUserData) 
      : renderProp(mockNeedData);
  }
}));

vi.mock('./needviewer/NeedViewer', () => ({
  default: ({ instructorId, initial }: any) => (
    <div data-testid="need-viewer">
      <div>Instructor ID: {instructorId}</div>
      <div>Sections: {initial?.sections?.length || 0}</div>
      <div>Years: {initial?.existingYears?.join(', ') || 'None'}</div>
      <div>Courses: {initial?.allAssignedCourses?.length || 0}</div>
    </div>
  )
}));

vi.mock('../../../../components/layout/tabnav/TabNav', () => ({
  default: ({ roles }: any) => (
    <div data-testid="tab-nav">
      <div>Roles: {roles?.join(', ') || 'None'}</div>
    </div>
  )
}));

const mockUseAuth = vi.fn();
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

vi.mock('../../../../api/user/fetchUserDetails', () => ({
  fetchUserDetails: vi.fn(() => Promise.resolve({
    id: 123,
    firstName: 'John',
    lastName: 'Doe',
    roles: ['INSTRUCTOR']
  }))
}));

const mockFetchDeadlines = vi.fn();
vi.mock('../../../../api/admin/FetchDeadline', () => ({
  fetchDeadlines: () => mockFetchDeadlines()
}));

vi.mock('../../../../api/instructor/fetchAllSectionsAndNeedAndAllocations', () => ({
  fetchAllSectionsAndNeedAndAllocations: vi.fn(() => Promise.resolve([]))
}));

vi.mock('../../../../api/course/sectionfilter/fetchAllExistingDeptCodes', () => ({
  fetchAllExistingDeptCodes: vi.fn(() => Promise.resolve(['COSC', 'MATH']))
}));

vi.mock('../../../../api/course/sectionfilter/fetchAllExistingYears', () => ({
  fetchAllExistingYears: vi.fn(() => Promise.resolve(['2024', '2023']))
}));

vi.mock('../../../../api/instructor/fetchSectionNeedAndAllocations', () => ({
  fetchSectionNeedAndAllocations: vi.fn(() => Promise.resolve([]))
}));

vi.mock('../../../../api/instructor/fetchAllInstructorCourses', () => ({
  fetchAllInstructorCourses: vi.fn(() => Promise.resolve([]))
}));

// Mock React Icons
vi.mock('react-icons/fa', () => ({
  FaRegClock: () => <div data-testid="clock-icon">🕒</div>
}));

// Mock useParams
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams()
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('InstructorNeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ userId: '123' });
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      userRoles: ['INSTRUCTOR'],
      user: { id: 123, firstName: 'John', lastName: 'Doe' }
    });
    mockFetchDeadlines.mockResolvedValue([
      {
        id: 1,
        name: 'instructor_need_update_deadline',
        endTime: '2024-12-31T23:59:59Z',
        description: 'TA Requirements Deadline'
      }
    ]);
  });

  it('renders the main container with correct styling', () => {
    renderWithRouter(<InstructorNeedPage />);
    
    const mainContainer = screen.getByTestId('tab-nav').closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });

  it('renders TabNav component with user roles', () => {
    renderWithRouter(<InstructorNeedPage />);
    
    expect(screen.getByTestId('tab-nav')).toBeInTheDocument();
    expect(screen.getByText('Roles: None')).toBeInTheDocument();
  });

  it('renders header when not viewed by coordinator', () => {
    renderWithRouter(<InstructorNeedPage />);
    
    expect(screen.getByText('TA Information')).toBeInTheDocument();
    expect(screen.getByText('Manage your sections and TA requirements')).toBeInTheDocument();
  });

  it('hides header when viewed by coordinator', () => {
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      userRoles: ['COORDINATOR'],
      user: { id: 456, firstName: 'Admin', lastName: 'User' }
    });
    
    renderWithRouter(<InstructorNeedPage />);
    
    expect(screen.queryByText('TA Information')).not.toBeInTheDocument();
    expect(screen.queryByText('Manage your sections and TA requirements')).not.toBeInTheDocument();
  });

  it('displays deadline information successfully', async () => {
    renderWithRouter(<InstructorNeedPage />);
    
    await waitFor(() => {
      expect(screen.getByText('TA Requirements Deadline')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByText(/Please submit your TA requirements before this deadline/)).toBeInTheDocument();
    });
  });

  it('displays deadline date correctly', async () => {
    renderWithRouter(<InstructorNeedPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument();
    });
  });

  it('handles deadline fetch error', async () => {
    mockFetchDeadlines.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter(<InstructorNeedPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Deadline')).toBeInTheDocument();
      expect(screen.getByText('Could not load need update deadline.')).toBeInTheDocument();
    });
  });

  it('displays no deadline message when deadline not found', async () => {
    mockFetchDeadlines.mockResolvedValue([
      {
        id: 1,
        name: 'other_deadline',
        endTime: '2024-12-31T23:59:59Z'
      }
    ]);
    
    renderWithRouter(<InstructorNeedPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No Deadline Set')).toBeInTheDocument();
      expect(screen.getByText('No requirements deadline configured.')).toBeInTheDocument();
    });
  });

  it('renders NeedViewer component with correct props', () => {
    renderWithRouter(<InstructorNeedPage />);
    
    expect(screen.getByTestId('need-viewer')).toBeInTheDocument();
    expect(screen.getByText('Instructor ID: 123')).toBeInTheDocument();
  });

  it('passes correct data to NeedViewer', () => {
    renderWithRouter(<InstructorNeedPage />);
    
    expect(screen.getByText('Sections: 1')).toBeInTheDocument();
    expect(screen.getByText('Years: 2024, 2023')).toBeInTheDocument();
    expect(screen.getByText('Courses: 1')).toBeInTheDocument();
  });

  it('handles missing userId parameter', () => {
    mockUseParams.mockReturnValue({});
    
    renderWithRouter(<InstructorNeedPage />);
    
    expect(screen.getByTestId('need-viewer')).toBeInTheDocument();
  });

  it('applies correct container styling', () => {
    renderWithRouter(<InstructorNeedPage />);
    
    const contentContainer = screen.getByTestId('tab-nav').closest('.max-w-7xl');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('mx-auto', 'space-y-8', 'p-6');
  });

  it('applies correct deadline styling for success state', async () => {
    renderWithRouter(<InstructorNeedPage />);
    
    await waitFor(() => {
      const deadlineContainer = screen.getByText('TA Requirements Deadline').closest('.bg-blue-50');
      expect(deadlineContainer).toBeInTheDocument();
      expect(deadlineContainer).toHaveClass('border-l-3', 'border-blue-400');
    });
  });

  it('handles instructor ID conversion correctly', () => {
    mockUseParams.mockReturnValue({ userId: '456' });
    
    renderWithRouter(<InstructorNeedPage />);
    
    expect(screen.getByText('Instructor ID: 456')).toBeInTheDocument();
  });
});
