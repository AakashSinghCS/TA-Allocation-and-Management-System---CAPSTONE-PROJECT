import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import React from 'react';
import StudentsAllocatedPage from './StudentsAllocatedPage';
import { fetchUserDetails } from '../../../../api/user/fetchUserDetails';
import { fetchAllExistingYears } from '../../../../api/course/sectionfilter/fetchAllExistingYears';
import { fetchSectionNeedAndAllocations } from '../../../../api/instructor/fetchSectionNeedAndAllocations';
import { fetchAllInstructorCourses } from '../../../../api/instructor/fetchAllInstructorCourses';
import { fetchAllocationById } from '../../../../api/allocation/fetchAllocationById';

// Mock all the API functions
vi.mock('../../../../api/user/fetchUserDetails');
vi.mock('../../../../api/course/sectionfilter/fetchAllExistingYears');
vi.mock('../../../../api/instructor/fetchSectionNeedAndAllocations');
vi.mock('../../../../api/instructor/fetchAllInstructorCourses');
vi.mock('../../../../api/allocation/fetchAllocationById');

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ userId: '123' }),
  };
});

// Mock AuthContext
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    userRoles: ['INSTRUCTOR'],
    user: { id: 123, firstName: 'John', lastName: 'Doe' },
    token: 'mock-token',
  }),
  AuthProvider: ({ children }: any) => children,
}));

// Mock TabNav component
vi.mock('../../../../components/layout/tabnav/TabNav', () => ({
  default: ({ roles }: any) => (
    <div data-testid="tab-nav">TabNav - {roles?.join(', ')}</div>
  ),
}));

// Mock the GenericAPIContainer
vi.mock('../../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ fetchFunction, render }: any) => {
    React.useEffect(() => {
      fetchFunction();
    }, [fetchFunction]);
    return (
      <div data-testid="api-container">
        {render({ id: 123, firstName: 'John', lastName: 'Doe', roles: ['INSTRUCTOR'] })}
      </div>
    );
  },
}));

// Mock the component imports
vi.mock('../../../../components/features/allocatedStudent', () => ({
  FilterSection: ({ onSearch, onExportCSV, onExportPDF }: any) => (
    <div data-testid="filter-section">
      <button onClick={onSearch} data-testid="search-button">Search</button>
      <button onClick={onExportCSV} data-testid="export-csv-button">Export CSV</button>
      <button onClick={onExportPDF} data-testid="export-pdf-button">Export PDF</button>
    </div>
  ),
  SectionCard: ({ section }: any) => (
    <div data-testid="section-card">
      {section.course?.deptCode} {section.course?.courseNum}
    </div>
  ),
  exportToCSV: vi.fn(),
  exportToPDF: vi.fn(),
}));

const mockUserDetails = {
  id: 123,
  firstName: 'John',
  lastName: 'Doe',
  roles: ['INSTRUCTOR'],
};

const mockCourses = [
  { id: 1, deptCode: 'COSC', courseNum: '111', name: 'Introduction to Computer Science' },
  { id: 2, deptCode: 'MATH', courseNum: '125', name: 'Calculus I' },
];

const mockSections = [
  {
    id: 1,
    semester: 'W1',
    section: '001',
    type: 'LEC',
    year: 2024,
    course: mockCourses[0],
    allocatedSections: [
      { allocationId: 1 },
    ],
    instructor: { id: 123, firstName: 'John', lastName: 'Doe' },
  },
];

const mockYears = ['2023', '2024', '2025'];

describe('StudentsAllocatedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (fetchUserDetails as Mock).mockResolvedValue(mockUserDetails);
    (fetchAllExistingYears as Mock).mockResolvedValue(mockYears);
    (fetchSectionNeedAndAllocations as Mock).mockResolvedValue(mockSections);
    (fetchAllInstructorCourses as Mock).mockResolvedValue(mockCourses);
    (fetchAllocationById as Mock).mockResolvedValue({
      id: 1,
      labPrepHours: 0,
      gradingHours: 0,
      sectionHours: 0,
      status: 'CONFIRMED',
      student: {
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      },
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <StudentsAllocatedPage />
      </BrowserRouter>
    );

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Students Allocated')).toBeInTheDocument();
  });

  it('displays the page header and description', () => {
    renderComponent();
    expect(screen.getByText('Students Allocated')).toBeInTheDocument();
    expect(screen.getByText('View and manage student allocations for your courses')).toBeInTheDocument();
  });

  it('loads initial data on component mount', async () => {
    renderComponent();
    await waitFor(() => {
      expect(fetchUserDetails).toHaveBeenCalledWith(123);
      expect(fetchAllExistingYears).toHaveBeenCalled();
      expect(fetchSectionNeedAndAllocations).toHaveBeenCalledWith(123, null, 2025, 'W1');
      expect(fetchAllInstructorCourses).toHaveBeenCalledWith(123);
      expect(fetchAllocationById).toHaveBeenCalledWith(1);
    });
  });

  it('renders FilterSection component', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('filter-section')).toBeInTheDocument();
    });
  });

  it('renders SectionCard components for sections with TAs', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('section-card')).toBeInTheDocument();
      expect(screen.getByText('COSC 111')).toBeInTheDocument();
    });
  });

  it('displays no students message when no sections have TAs', async () => {
    (fetchSectionNeedAndAllocations as Mock).mockResolvedValue([]);
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('No students allocated')).toBeInTheDocument();
      expect(screen.getByText('No student allocations found for the selected criteria.')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('search-button')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('search-button'));
    await waitFor(() => {
      expect(fetchSectionNeedAndAllocations).toHaveBeenCalledTimes(2);
      expect(fetchAllocationById).toHaveBeenCalledTimes(2);
    });
  });

  it('handles export CSV functionality', async () => {
    const { exportToCSV } = await import('../../../../components/features/allocatedStudent');
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('export-csv-button')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('export-csv-button'));
    expect(exportToCSV).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 1 })
    ]));
  });

  it('handles export PDF functionality', async () => {
    const { exportToPDF } = await import('../../../../components/features/allocatedStudent');
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('export-pdf-button')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('export-pdf-button'));
    expect(exportToPDF).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: 1 })
    ]));
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (fetchAllExistingYears as Mock).mockRejectedValue(new Error('API Error'));
    renderComponent();
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load initial data:', expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it('filters sections correctly', async () => {
    const sectionsWithoutAllocations = [
      {
        id: 2,
        semester: 'W1',
        section: '002',
        type: 'LAB',
        year: 2024,
        course: mockCourses[1],
        allocatedSections: [],
        instructor: { id: 123, firstName: 'John', lastName: 'Doe' },
      },
    ];
    (fetchSectionNeedAndAllocations as Mock).mockResolvedValue([
      ...mockSections,
      ...sectionsWithoutAllocations,
    ]);
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('section-card')).toBeInTheDocument();
      expect(screen.queryByText('MATH 125')).not.toBeInTheDocument();
    });
  });

  it('handles search with error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('search-button')).toBeInTheDocument();
    });
    (fetchSectionNeedAndAllocations as Mock).mockRejectedValueOnce(new Error('Search Error'));
    fireEvent.click(screen.getByTestId('search-button'));
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to search sections:', expect.any(Error));
    });
    consoleSpy.mockRestore();
  });
});
