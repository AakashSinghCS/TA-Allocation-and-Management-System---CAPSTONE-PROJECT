import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseProfilePage from './CourseProfilePage';

// Mock dependencies
vi.mock('../section/sectionprofiledetailssection/SectionProfileDetailsSection', () => ({
  default: ({ section }: any) => (
    <div data-testid="section-profile-details">
      Section Profile: {section?.name || 'Loading...'}
    </div>
  )
}));

vi.mock('./courseprofiledetails/CourseProfileDetails', () => ({
  default: ({ course }: any) => (
    <div data-testid="course-profile-details">
      Course Profile: {course?.name || 'Loading...'}
    </div>
  )
}));

vi.mock('../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ render, fetchFunction }: any) => {
    // Simulate loading/success state
    const mockData = fetchFunction.toString().includes('fetchCourse') 
      ? { name: 'Test Course' }
      : { name: 'Test Section' };
    return render(mockData);
  }
}));

vi.mock('../../../api/course/fetchCourse', () => ({
  fetchCourse: vi.fn(() => Promise.resolve({ name: 'Test Course' }))
}));

vi.mock('../../../api/section/fetchSectionIncludeInstructorId', () => ({
  fetchSectionIncludeInstructorId: vi.fn(() => Promise.resolve({ name: 'Test Section' }))
}));

vi.mock('../../../interfaces/section/Section', () => ({
  sectionFieldLabels: { name: 'Section Name' },
  sectionProfileFields: ['name']
}));

vi.mock('../../../interfaces/course/Course', () => ({
  courseFieldLabels: { name: 'Course Name' },
  courseProfileFields: ['name']
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

describe('CourseProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section profile when sectionId is provided and courseId is not', () => {
    mockUseParams.mockReturnValue({ sectionId: '123', courseId: undefined });
    
    renderWithRouter(<CourseProfilePage />);
    
    expect(screen.getByTestId('section-profile-details')).toBeInTheDocument();
    expect(screen.getByText('Section Profile: Test Section')).toBeInTheDocument();
  });

  it('renders course profile when courseId is provided', () => {
    mockUseParams.mockReturnValue({ sectionId: '123', courseId: '456' });
    
    renderWithRouter(<CourseProfilePage />);
    
    expect(screen.getByTestId('course-profile-details')).toBeInTheDocument();
    expect(screen.getByText('Course Profile: Test Course')).toBeInTheDocument();
  });

  it('renders with correct container styling for section', () => {
    mockUseParams.mockReturnValue({ sectionId: '123', courseId: undefined });
    
    renderWithRouter(<CourseProfilePage />);
    
    const container = screen.getByTestId('section-profile-details').closest('.max-w-7xl');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mx-auto', 'px-4');
  });

  it('renders with correct container styling for course', () => {
    mockUseParams.mockReturnValue({ sectionId: '123', courseId: '456' });
    
    renderWithRouter(<CourseProfilePage />);
    
    const container = screen.getByTestId('course-profile-details').closest('.max-w-7xl');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mx-auto', 'px-4');
  });

  it('determines isCourse correctly based on courseId presence', () => {
    // Test with courseId (should be course)
    mockUseParams.mockReturnValue({ sectionId: '123', courseId: '456' });
    const { unmount } = renderWithRouter(<CourseProfilePage />);
    expect(screen.getByTestId('course-profile-details')).toBeInTheDocument();
    unmount();
    
    // Test without courseId (should be section)
    mockUseParams.mockReturnValue({ sectionId: '123', courseId: undefined });
    renderWithRouter(<CourseProfilePage />);
    expect(screen.getByTestId('section-profile-details')).toBeInTheDocument();
  });
});
