import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentQualificationPage from './StudentQualificationPage';

// Mock dependencies
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    userRoles: ['STUDENT']
  }))
}));

vi.mock('../../../../components/layout/tabnav/TabNav', () => ({
  default: ({ roles }: any) => (
    <div data-testid="tab-nav">TabNav with roles: {roles.join(', ')}</div>
  )
}));

vi.mock('./qualificationviewer/StudentQualificationViewer', () => ({
  default: ({ studentId }: any) => (
    <div data-testid="qualification-viewer">Student Qualification Viewer for ID: {studentId}</div>
  )
}));

vi.mock('../../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ render }: any) => {
    const mockUser = { roles: ['STUDENT'] };
    return render(mockUser);
  }
}));

vi.mock('../../../../api/user/fetchUserDetails', () => ({
  fetchUserDetails: vi.fn(() => Promise.resolve({ roles: ['STUDENT'] }))
}));

vi.mock('../../../../interfaces/enum/UserRole', () => ({
  UserRole: {
    STUDENT: 'STUDENT',
    COORDINATOR: 'COORDINATOR',
    ADMIN: 'ADMIN'
  }
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

describe('StudentQualificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ userId: '123' });
  });

  it('renders the main container with correct styling', () => {
    renderWithRouter(<StudentQualificationPage />);
    
    const section = screen.getByRole('main').closest('section');
    expect(section).toHaveClass('px-4', 'py-6', 'md:px-8', 'md:py-8', 'min-h-screen');
  });

  it('renders TabNav component with user roles', () => {
    renderWithRouter(<StudentQualificationPage />);
    
    expect(screen.getByTestId('tab-nav')).toBeInTheDocument();
    expect(screen.getByText('TabNav with roles: STUDENT')).toBeInTheDocument();
  });

  it('renders StudentQualificationViewer with correct studentId', () => {
    mockUseParams.mockReturnValue({ userId: '456' });
    
    renderWithRouter(<StudentQualificationPage />);
    
    expect(screen.getByTestId('qualification-viewer')).toBeInTheDocument();
    expect(screen.getByText('Student Qualification Viewer for ID: 456')).toBeInTheDocument();
  });

  it('shows student-specific content when user is not coordinator/admin', () => {
    renderWithRouter(<StudentQualificationPage />);
    
    expect(screen.getByText('Skills & Qualifications')).toBeInTheDocument();
    expect(screen.getByText('Important Notice')).toBeInTheDocument();
    expect(screen.getByText('How to Use')).toBeInTheDocument();
  });

  it('applies correct grid layout for student view', () => {
    renderWithRouter(<StudentQualificationPage />);
    
    const gridContainer = screen.getByRole('main').closest('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-4');
    
    // Check sidebar exists for student
    expect(screen.getByText('How to Use')).toBeInTheDocument();
  });
});
