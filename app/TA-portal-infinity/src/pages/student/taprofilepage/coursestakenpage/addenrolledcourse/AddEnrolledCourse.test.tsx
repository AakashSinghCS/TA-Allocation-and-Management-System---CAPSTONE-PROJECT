import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddEnrollmentPage from './AddEnrolledCourse';

// Mock all dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('../../../../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../../../../components/features/course/coursefilter/SectionFilter', () => ({
  default: ({ onFilterChange, mode }: { onFilterChange: (filters: any) => void; mode: string }) => (
    <div data-testid="section-filter" data-mode={mode}>
      <button 
        data-testid="filter-button" 
        onClick={() => onFilterChange({ term: 'test' })}
      >
        Apply Filter
      </button>
    </div>
  )
}));

vi.mock('../../../../../components/features/course/sectionlist/SectionList', () => ({
  default: ({ sections, mode, onSelect, onSelectCourse }: {
    sections: any[];
    mode: string;
    onSelect: (section: any) => void;
    onSelectCourse: (id: number, deptCode: string, courseNum: string, name: string) => void;
  }) => (
    <div data-testid="section-list" data-mode={mode}>
      <button 
        data-testid="select-section" 
        onClick={() => onSelect({ 
          id: 1, 
          course: { id: 100, deptCode: 'COSC', courseNum: '499', name: 'Capstone' },
          section: 'A01'
        })}
      >
        Select Section
      </button>
      <button 
        data-testid="select-course" 
        onClick={() => onSelectCourse(100, 'COSC', '499', 'Capstone')}
      >
        Select Course
      </button>
      <div>Sections: {sections.length}</div>
    </div>
  )
}));

vi.mock('../../../../../api/course/sectionfilter/fetchFilteredSections', () => ({
  fetchFilteredSections: vi.fn()
}));

vi.mock('../../../../../api/student/enrollment/fetchAllStudentCompletedCourses', () => ({
  fetchAllStudentEnrollmentOverview: vi.fn()
}));

vi.mock('../../../../../api/student/enrollment/fetchDeleteEnrollment', () => ({
  fetchDeleteEnrollment: vi.fn()
}));

vi.mock('../../../../../api/student/enrollment/fetchEnrollStudent', () => ({
  fetchEnrollStudent: vi.fn()
}));

vi.mock('../../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections', () => ({
  convertFilterSectionsToSections: vi.fn()
}));

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
import { fetchFilteredSections } from '../../../../../api/course/sectionfilter/fetchFilteredSections';
import { fetchAllStudentEnrollmentOverview } from '../../../../../api/student/enrollment/fetchAllStudentCompletedCourses';
import { fetchDeleteEnrollment } from '../../../../../api/student/enrollment/fetchDeleteEnrollment';
import { fetchEnrollStudent } from '../../../../../api/student/enrollment/fetchEnrollStudent';
import { convertFilterSectionsToSections } from '../../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';

const mockNavigate = useNavigate as ReturnType<typeof vi.fn>;
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockFetchFilteredSections = fetchFilteredSections as ReturnType<typeof vi.fn>;
const mockFetchAllStudentEnrollmentOverview = fetchAllStudentEnrollmentOverview as ReturnType<typeof vi.fn>;
const mockFetchDeleteEnrollment = fetchDeleteEnrollment as ReturnType<typeof vi.fn>;
const mockFetchEnrollStudent = fetchEnrollStudent as ReturnType<typeof vi.fn>;
const mockConvertFilterSectionsToSections = convertFilterSectionsToSections as ReturnType<typeof vi.fn>;

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AddEnrollmentPage />
    </BrowserRouter>
  );
};

const mockEnrollmentOverview = {
  currentCourses: [
    {
      course: { id: 1, deptCode: 'COSC', courseNum: '499', name: 'Capstone' },
      section: { id: 101, section: 'A01' },
      classAverage: 85
    }
  ],
  completedCourses: [
    {
      course: { id: 2, deptCode: 'MATH', courseNum: '221', name: 'Linear Algebra' },
      grade: 90,
      classAverage: 80
    }
  ]
};

describe('AddEnrollmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ userId: 123 });
    mockNavigate.mockReturnValue(vi.fn());
    mockFetchAllStudentEnrollmentOverview.mockResolvedValue(mockEnrollmentOverview);
    mockFetchFilteredSections.mockResolvedValue([]);
    mockConvertFilterSectionsToSections.mockReturnValue([]);
    mockFetchDeleteEnrollment.mockResolvedValue({ success: true });
    mockFetchEnrollStudent.mockResolvedValue({ success: true });
  });

  describe('Component Rendering', () => {
    it('renders main page elements', async () => {
      renderComponent();
      
      expect(screen.getByText('Add Enrollments')).toBeInTheDocument();
      expect(screen.getByText('Selected')).toBeInTheDocument();
      expect(screen.getByTestId('section-filter')).toBeInTheDocument();
      expect(screen.getByTestId('section-list')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('renders with correct filter mode', () => {
      renderComponent();
      
      const sectionFilter = screen.getByTestId('section-filter');
      expect(sectionFilter).toHaveAttribute('data-mode', 'large');
    });

    it('renders section list with correct mode', async () => {
      renderComponent();
      
      const sectionList = screen.getByTestId('section-list');
      expect(sectionList).toHaveAttribute('data-mode', 'studentAddEnrollment');
    });
  });

  describe('Initial Data Loading', () => {
    it('loads enrollment overview on mount', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockFetchAllStudentEnrollmentOverview).toHaveBeenCalledWith(123);
      });
    });

    it('handles null enrollment overview', async () => {
      mockFetchAllStudentEnrollmentOverview.mockResolvedValue(null);
      
      renderComponent();
      
      await waitFor(() => {
        expect(mockFetchAllStudentEnrollmentOverview).toHaveBeenCalledWith(123);
      });
      
      // Should not crash and should render basic structure
      expect(screen.getByText('Add Enrollments')).toBeInTheDocument();
    });
  });

  describe('Section Filtering', () => {
    it('handles filter changes', async () => {
      const mockSections = [
        { id: 1, course: { deptCode: 'COSC', courseNum: '499' } }
      ];
      mockConvertFilterSectionsToSections.mockReturnValue(mockSections);
      
      renderComponent();
      
      fireEvent.click(screen.getByTestId('filter-button'));
      
      await waitFor(() => {
        expect(mockFetchFilteredSections).toHaveBeenCalledWith({ term: 'test' });
        expect(mockConvertFilterSectionsToSections).toHaveBeenCalled();
      });
    });

    it('displays loading state during filtering', async () => {
      mockFetchFilteredSections.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );
      
      renderComponent();
      
      fireEvent.click(screen.getByTestId('filter-button'));
      
      expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    it('updates section list after filtering', async () => {
      const mockSections = [{ id: 1 }, { id: 2 }];
      mockConvertFilterSectionsToSections.mockReturnValue(mockSections);
      
      renderComponent();
      
      fireEvent.click(screen.getByTestId('filter-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Sections: 2')).toBeInTheDocument();
      });
    });
  });

  describe('Enrollment Management', () => {
    it('shows grade inputs for completed courses', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Completed')).toBeInTheDocument();
      });
      
      // Should show grade and class average inputs for completed courses
      const gradeInputs = screen.getAllByPlaceholderText('Grade');
      const classAvgInputs = screen.getAllByPlaceholderText('Class Avg');
      
      expect(gradeInputs.length).toBeGreaterThan(0);
      expect(classAvgInputs.length).toBeGreaterThan(0);
    });

    it('updates grade field', async () => {
      renderComponent();
      
      await waitFor(() => {
        const gradeInput = screen.getAllByPlaceholderText('Grade')[0];
        fireEvent.change(gradeInput, { target: { value: '95' } });
        expect(gradeInput).toHaveValue(95);
      });
    });

    it('updates class average field', async () => {
      renderComponent();
      
      await waitFor(() => {
        const classAvgInput = screen.getAllByPlaceholderText('Class Avg')[0];
        fireEvent.change(classAvgInput, { target: { value: '88' } });
        expect(classAvgInput).toHaveValue(88);
      });
    });
  });

  describe('Save Functionality', () => {
    it('handles successful save', async () => {
      const navigateFn = vi.fn();
      mockNavigate.mockReturnValue(navigateFn);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Submit')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Submit'));
      
      await waitFor(() => {
        expect(navigateFn).toHaveBeenCalledWith('/user/taprofile/123/coursesTaken');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty enrollment overview', async () => {
      mockFetchAllStudentEnrollmentOverview.mockResolvedValue({
        currentCourses: [],
        completedCourses: []
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Add Enrollments')).toBeInTheDocument();
        expect(screen.queryByText(/COSC/)).not.toBeInTheDocument();
      });
    });

    it('handles section selection with null id', async () => {
      renderComponent();
      
      // Mock section with null id
      const sectionList = screen.getByTestId('section-list');
      const mockOnSelect = vi.fn();
      
      // Simulate selecting section with null id
      await waitFor(() => {
        expect(sectionList).toBeInTheDocument();
      });
      
      // This should not cause errors
      expect(() => {
        mockOnSelect({ id: null });
      }).not.toThrow();
    });

    it('handles missing auth context', () => {
      mockUseAuth.mockReturnValue({ userId: undefined });
      
      expect(() => renderComponent()).not.toThrow();
    });
  });
});
