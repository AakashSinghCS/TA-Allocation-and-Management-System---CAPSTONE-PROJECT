import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InstructorAddSectionPage from './InstructorAddSectionPage';
import type Section from '../../../../../interfaces/section/Section';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockConvert = vi.fn();
const mockAssign = vi.fn();
const mockFetchGetNeed = vi.fn();
const mockFetchUpdateNeed = vi.fn();

// stub out react-router hooks
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// mock the SectionSearchPage hook
vi.mock('../../../../../api/course/sectionfilter/useSectionFilter', () => ({
  useSectionSearchPage: () => ({
    data: { content: [], totalPages: 0 },
    isFetching: false,
    isError: false,
    error: null,
  }),
}));

// mock conversion util
vi.mock('../../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections', () => ({
  convertFilterSectionsToSections: (...args: any[]) => mockConvert(...args),
}));

// mock assign API
vi.mock('../../../../../api/section/instructor/fetchAssignInstructor', () => ({
  fetchAssignInstructor: (...args: any[]) => mockAssign(...args),
}));

// mock need APIs
vi.mock('../../../../../api/need/fetchGetNeed', () => ({
  fetchGetNeed: (...args: any[]) => mockFetchGetNeed(...args),
}));

vi.mock('../../../../../api/need/fetchUpdateNeed', () => ({
  fetchUpdateNeed: (...args: any[]) => mockFetchUpdateNeed(...args),
}));

// mock useDebounce to return value immediately
vi.mock('../../../../../utility/pagination/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

// mock AuthContext
vi.mock('../../../../../context/AuthContext', () => ({
  useAuth: () => ({ userId: 123 }),
}));

// mock alert
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
});

// mock SectionFilter 
vi.mock('../../../../../components/features/course/coursefilter/SectionFilter', () => ({
  default: ({ onFilterChange }: { onFilterChange: Function }) => (
    <button data-testid="filter-btn" onClick={() => onFilterChange({ foo: 'bar' })}>
      Apply Filter
    </button>
  ),
}));

// mock SectionList 
vi.mock('../../../../../components/features/course/sectionlist/SectionList', () => ({
  default: ({ 
    sections, 
    onSelect, 
    onSelectCourse 
  }: { 
    sections: Section[] | null; 
    onSelect?: (s: Section) => void;
    onSelectCourse?: (courseId: number) => void;
  }) => (
    <div data-testid="section-list">
      {sections?.map((s) => (
        <div key={s.id}>
          <button 
            data-testid={`select-${s.id}`} 
            onClick={() => onSelect?.(s)}
          >
            Select {s.id}
          </button>
          {onSelectCourse && (
            <button 
              data-testid={`select-course-${s.course?.id}`} 
              onClick={() => onSelectCourse(s.course?.id || 0)}
            >
              Select Course {s.course?.id}
            </button>
          )}
        </div>
      ))}
    </div>
  ),
}));

// mock Pagination
vi.mock('../../../../../utility/pagination/pagination/Pagination', () => ({
  default: ({ page, pageCount, onPrev, onNext }: any) => (
    <div data-testid="pagination">
      <button data-testid="prev-page" onClick={onPrev}>Previous</button>
      <span>Page {page + 1} of {pageCount}</span>
      <button data-testid="next-page" onClick={onNext}>Next</button>
    </div>
  ),
}));

describe('InstructorAddSectionPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockConvert.mockReturnValue([]);
    mockAssign.mockResolvedValue(true);
    mockFetchGetNeed.mockResolvedValue({
      description: 'Test description',
      requiredGradingHours: 10,
      numHoursCurrentlyAllocated: 5,
      prerequisites: []
    });
    mockFetchUpdateNeed.mockResolvedValue(true);
    mockUseParams.mockReturnValue({});
  });

  describe('Basic Rendering', () => {
    it('renders add mode correctly', async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="add" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText('Search for a Section')).toBeInTheDocument();
      expect(screen.getByText('Search for a section and click Select in the far right column.')).toBeInTheDocument();
      expect(screen.queryByText('Selected Prerequisite Sections')).not.toBeInTheDocument();
    });

    it('renders update mode correctly', async () => {
      mockUseParams.mockReturnValue({
        courseId: '101',
        year: '2024',
        semester: 'Fall'
      });

      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText('Update Course Prerequisites')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Selected Prerequisite Sections')).toBeInTheDocument();
      });
    });

    it('shows section filter component', () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('filter-btn')).toBeInTheDocument();
    });

    it('shows section list when not loading', () => {
      mockConvert.mockReturnValue([]);
      
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('section-list')).toBeInTheDocument();
    });

    it('shows pagination component', () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  describe('Add Mode Functionality', () => {
    it('successfully assigns instructor to section when select is clicked', async () => {
      mockConvert.mockReturnValue([{ id: 42 }]);

      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="add" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      const selectButton = screen.getByTestId('select-42');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockAssign).toHaveBeenCalledWith(123, 42);
        expect(window.alert).toHaveBeenCalledWith('Section added!');
        expect(mockNavigate).toHaveBeenCalledWith('/user/instructorprofile/123/need');
      });
    });

    it('handles assignment failure', async () => {
      mockAssign.mockResolvedValue(false);
      mockConvert.mockReturnValue([{ id: 42 }]);

      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="add" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      const selectButton = screen.getByTestId('select-42');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to add section.');
      });
    });
  });

  describe('Update Mode Functionality', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({
        courseId: '101',
        year: '2024',
        semester: 'Fall'
      });
    });

    it('loads existing need data on mount', async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockFetchGetNeed).toHaveBeenCalledWith(101, 2024, 'Fall');
      });
    });

    it('handles need fetch error', async () => {
      mockFetchGetNeed.mockRejectedValue(new Error('Fetch failed'));
      
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/error', {
          replace: true,
          state: { message: 'Fetch failed' }
        });
      });
    });

    it('updates description field correctly', async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
      });

      const textarea = screen.getByLabelText('Additional Comments');
      fireEvent.change(textarea, { target: { value: 'Updated description' } });

      expect(screen.getByDisplayValue('Updated description')).toBeInTheDocument();
    });

    it('updates required hours field correctly', async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('Required Grading Hours');
      fireEvent.change(input, { target: { value: '15' } });

      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    });

    it('handles invalid number input for required hours', async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      const input = screen.getByLabelText('Required Grading Hours');
      fireEvent.change(input, { target: { value: 'invalid' } });

      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    });

    it('saves prerequisites successfully', async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Save Prerequisites')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Save Prerequisites'));

      await waitFor(() => {
        expect(mockFetchUpdateNeed).toHaveBeenCalledWith({
          description: 'Test description',
          requiredGradingHours: 10,
          numHoursCurrentlyAllocated: 5,
          courseId: 101,
          year: 2024,
          semester: 'Fall',
          prerequisites: []
        });
        expect(window.alert).toHaveBeenCalledWith('Prerequisites updated!');
        expect(mockNavigate).toHaveBeenCalledWith('/user/instructorprofile/123/need');
      });
    });

    it('handles save prerequisites failure', async () => {
      mockFetchUpdateNeed.mockResolvedValue(false);
      
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Save Prerequisites')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Save Prerequisites'));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to update prerequisites.');
      });
    });
  });

  describe('Prerequisite Management', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({
        courseId: '101',
        year: '2024',
        semester: 'Fall'
      });
      
      mockFetchGetNeed.mockResolvedValue({
        description: 'Test description',
        requiredGradingHours: 10,
        numHoursCurrentlyAllocated: 5,
        prerequisites: [
          { id: 201, deptCode: 'MATH', courseNum: '100', name: 'Calculus I' }
        ]
      });
    });

    it('displays existing prerequisites', async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('MATH 100 – Calculus I')).toBeInTheDocument();
      });
    });

    it('removes prerequisite when remove button is clicked', async () => {
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('MATH 100 – Calculus I')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('MATH 100 – Calculus I')).not.toBeInTheDocument();
      });
    });

    it('adds prerequisite course when course is selected', async () => {
      mockConvert.mockReturnValue([
        { 
          id: 42, 
          course: { 
            id: 301, 
            deptCode: 'COSC', 
            courseNum: '111', 
            name: 'Intro to CS' 
          } 
        }
      ]);

      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('MATH 100 – Calculus I')).toBeInTheDocument();
      });

      // Click to select a new course
      fireEvent.click(screen.getByTestId('select-course-301'));

      await waitFor(() => {
        expect(screen.getByText('COSC 111 – Intro to CS')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing course in section for prerequisite selection', () => {
      mockConvert.mockReturnValue([{ id: 42, course: null }]);
      mockUseParams.mockReturnValue({
        courseId: '101',
        year: '2024',
        semester: 'Fall'
      });
      
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage mode="update" />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Should not crash when clicking on course selection with null course
      fireEvent.click(screen.getByTestId('select-course-undefined'));
      
      // No course should be added - no error should occur
      expect(screen.queryByText('null null – null')).not.toBeInTheDocument();
    });

    it('handles null filtered sections', () => {
      mockConvert.mockReturnValue(null);
      
      const queryClient = new QueryClient();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <InstructorAddSectionPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      const list = screen.getByTestId('section-list');
      expect(list).toBeInTheDocument();
      expect(list).toBeEmptyDOMElement();
    });
  });
});
