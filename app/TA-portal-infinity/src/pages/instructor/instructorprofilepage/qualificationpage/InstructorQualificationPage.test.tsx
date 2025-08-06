import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InstructorQualificationPage from './InstructorQualificationPage';

// Mock dependencies
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    token: 'mock-token',
    userRoles: ['INSTRUCTOR']
  }))
}));

vi.mock('./qualificationviewer/InstructorQualificationViewer', () => ({
  default: ({ instructorId, deadlinePassed }: any) => (
    <div data-testid="instructor-qualification-viewer">
      Instructor Qualification Viewer for ID: {instructorId}, Deadline Passed: {String(deadlinePassed)}
    </div>
  )
}));

vi.mock('../../../../components/layout/tabnav/TabNav', () => ({
  default: ({ roles }: any) => (
    <div data-testid="tab-nav">TabNav with roles: {roles.join(', ')}</div>
  )
}));

vi.mock('../../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ render }: any) => {
    const mockUser = { roles: ['INSTRUCTOR'] };
    return render(mockUser);
  }
}));

vi.mock('../../../../api/user/fetchUserDetails', () => ({
  fetchUserDetails: vi.fn(() => Promise.resolve({ roles: ['INSTRUCTOR'] }))
}));

vi.mock('../../../../api/admin/FetchDeadline', () => ({
  fetchDeadlines: vi.fn(() => Promise.resolve([
    {
      name: 'instructor_need_update_deadline',
      endTime: '2025-08-15T23:59:59Z'
    }
  ]))
}));

vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container">Toast Container</div>
}));

// Mock useParams hook
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

describe('InstructorQualificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ userId: '123' });
  });

  it('renders the main container with correct styling', () => {
    renderWithRouter(<InstructorQualificationPage />);
    
    const container = screen.getByTestId('instructor-qualification-viewer').closest('.min-h-screen');
    expect(container).toBeInTheDocument();
    expect(container?.querySelector('.max-w-7xl')).toBeInTheDocument();
  });

  it('renders TabNav component with user roles', () => {
    renderWithRouter(<InstructorQualificationPage />);
    
    expect(screen.getByTestId('tab-nav')).toBeInTheDocument();
    expect(screen.getByText('TabNav with roles: INSTRUCTOR')).toBeInTheDocument();
  });

  it('renders InstructorQualificationViewer with correct props', () => {
    mockUseParams.mockReturnValue({ userId: '456' });
    
    renderWithRouter(<InstructorQualificationPage />);
    
    expect(screen.getByTestId('instructor-qualification-viewer')).toBeInTheDocument();
    expect(screen.getByText('Instructor Qualification Viewer for ID: 456, Deadline Passed: false')).toBeInTheDocument();
  });

  it('shows instructor-specific header when user is not coordinator', () => {
    renderWithRouter(<InstructorQualificationPage />);
    
    expect(screen.getByText('Course Qualifications & Skills Management')).toBeInTheDocument();
    expect(screen.getByText('Manage your sections and TA requirements')).toBeInTheDocument();
  });

  it('renders information message with TA requirements', () => {
    renderWithRouter(<InstructorQualificationPage />);
    
    expect(screen.getByText('Reminder! TA Requirements')).toBeInTheDocument();
    expect(screen.getByText('Please update your TA requirements for your courses')).toBeInTheDocument();
  });

  it('displays deadline information when available', async () => {
    renderWithRouter(<InstructorQualificationPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Deadline:/)).toBeInTheDocument();
      expect(screen.getByText(/8\/15\/2025/)).toBeInTheDocument();
    });
  });

  it('renders important notice about qualifications', () => {
    renderWithRouter(<InstructorQualificationPage />);
    
    expect(screen.getByText('Important Notice')).toBeInTheDocument();
    expect(screen.getByText(/The qualifications you see below is a list accumulated by previous instructors/)).toBeInTheDocument();
    expect(screen.getByText(/permanently/)).toBeInTheDocument();
  });

  it('renders ToastContainer', () => {
    renderWithRouter(<InstructorQualificationPage />);
    
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });
});
