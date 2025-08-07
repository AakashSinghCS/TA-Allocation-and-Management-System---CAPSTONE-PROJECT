import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExportToCSVPage from './ExportToCSVPage';
import { AuthContext } from '../../../context/AuthContext';
import { UserRole } from '../../../interfaces/enum/UserRole';
import * as fetchExportSections from '../../../api/csv/fetchExportSections';
import * as useSectionFilterModule from '../../../api/course/sectionfilter/useSectionFilter';
import { convertFilterSectionsToSections } from '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import type PageableResponse from '../../../interfaces/admin/audit/PageableResponse';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the converter utility
vi.mock('../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections', () => ({
  convertFilterSectionsToSections: vi.fn(),
}));

// Mock the section filter API
vi.mock('../../../api/course/sectionfilter/useSectionFilter', () => ({
  useSectionSearchPage: vi.fn(),
}));

// Mock the CSV export API functions
vi.mock('../../../api/csv/fetchExportSections', () => ({
  fetchExportSectionsAsCSV: vi.fn(),
  fetchExportAllSectionsAsCSV: vi.fn(),
  downloadCSVBlob: vi.fn(),
}));

// Mock the section filter component
vi.mock('../../../components/features/course/coursefilter/SectionFilter', () => ({
  default: ({ onFilterChange }: { onFilterChange: (params: any) => void; mode?: string }) => (
    <div data-testid="section-filter">
      <button 
        onClick={() => onFilterChange({ deptCode: 'COSC', courseNum: '111' })}
        data-testid="search-button"
      >
        Search Sections
      </button>
    </div>
  ),
}));

// Mock the section list component
vi.mock('../../../components/features/course/sectionlist/SectionList', () => ({
  default: ({ sections, onSelect }: { sections: any[]; onSelect: (section: any) => void }) => (
    <div data-testid="section-list">
      {sections.map((section, index) => (
        <div 
          key={index}
          data-testid={`section-item-${index}`}
          onClick={() => onSelect(section)}
          style={{ cursor: 'pointer', padding: '8px', border: '1px solid #ccc', margin: '4px' }}
        >
          {section.sectionDetails?.deptCode} {section.sectionDetails?.courseNum} - {section.sectionDetails?.section}
        </div>
      ))}
    </div>
  ),
}));

const mockAuthContext = {
  token: 'test-token',
  userId: 1,
  userRoles: [UserRole.COORDINATOR],
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true,
};

// Mock data that matches the CourseSectionScheduleDto interface from backend
const mockCourseSectionScheduleDtos = [
  {
    sectionId: 1,
    courseId: 101,
    deptCode: 'COSC',
    name: 'Introduction to Programming',
    courseNum: '111',
    section: '001',
    year: 2025,
    semester: 'W1',
    type: 'LECTURE',
    scheduleDay: 'Monday',
    startTime: '10:00',
    endTime: '11:30',
    isCourse: true
  },
  {
    sectionId: 2,
    courseId: 101,
    deptCode: 'COSC',
    name: 'Introduction to Programming',
    courseNum: '111',
    section: 'L01',
    year: 2025,
    semester: 'W1',
    type: 'LABORATORY',
    scheduleDay: 'Wednesday',
    startTime: '14:00',
    endTime: '16:00',
    isCourse: true
  },
  {
    sectionId: 3,
    courseId: 201,
    deptCode: 'COSC',
    name: 'Data Structures and Algorithms',
    courseNum: '221',
    section: '001',
    year: 2025,
    semester: 'W1',
    type: 'LECTURE',
    scheduleDay: 'Tuesday',
    startTime: '12:00',
    endTime: '13:30',
    isCourse: true
  }
];

// Expected sections after conversion using convertFilterSectionsToSections
const mockSections = [
  {
    id: 1,
    semester: 'W1',
    section: '001',
    type: 'LECTURE' as const,
    year: 2025,
    course: {
      id: 101,
      name: 'Introduction to Programming',
      deptCode: 'COSC',
      courseNum: '111',
    },
    sectionSchedule: [
      {
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:30',
        sectionId: 1,
      }
    ],
    need: undefined,
    hasCompleted: undefined,
    allocations: undefined,
    instructor: undefined,
  },
  {
    id: 2,
    semester: 'W1',
    section: 'L01',
    type: 'LABORATORY' as const,
    year: 2025,
    course: {
      id: 101,
      name: 'Introduction to Programming',
      deptCode: 'COSC',
      courseNum: '111',
    },
    sectionSchedule: [
      {
        day: 'Wednesday',
        startTime: '14:00',
        endTime: '15:30',
        sectionId: 2,
      }
    ],
    need: undefined,
    hasCompleted: undefined,
    allocations: undefined,
    instructor: undefined,
  },
  {
    id: 3,
    semester: 'W1',
    section: '001',
    type: 'LECTURE' as const,
    year: 2025,
    course: {
      id: 102,
      name: 'Data Structures',
      deptCode: 'COSC',
      courseNum: '221',
    },
    sectionSchedule: [
      {
        day: 'Tuesday',
        startTime: '12:00',
        endTime: '13:30',
        sectionId: 3,
      }
    ],
    need: undefined,
    hasCompleted: undefined,
    allocations: undefined,
    instructor: undefined,
  }
];
const queryClient = new QueryClient();
const renderWithProviders = () =>
  render(
    <QueryClientProvider client={queryClient}>
    <AuthContext.Provider value={mockAuthContext}>
      <MemoryRouter>
        <ExportToCSVPage />
      </MemoryRouter>
    </AuthContext.Provider>
    </QueryClientProvider>
  );

describe('ExportToCSVPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.alert properly
    vi.stubGlobal('alert', vi.fn());
    
    // Setup default successful hook response
    vi.mocked(useSectionFilterModule.useSectionSearchPage).mockReturnValue({
      data: {
        content: mockCourseSectionScheduleDtos,
        totalPages: 1,
        totalElements: mockCourseSectionScheduleDtos.length,
        size: 10,
        number: 0,
      },
      isFetching: false,
      isError: false,
      error: null,
    } as any);
    
    // Mock the converter function to return the expected sections
    vi.mocked(convertFilterSectionsToSections).mockReturnValue(mockSections);
    vi.mocked(fetchExportSections.fetchExportSectionsAsCSV).mockResolvedValue(new Blob(['test csv content'], { type: 'text/csv' }));
    vi.mocked(fetchExportSections.fetchExportAllSectionsAsCSV).mockResolvedValue(new Blob(['test csv content'], { type: 'text/csv' }));
    vi.mocked(fetchExportSections.downloadCSVBlob).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('renders the main page elements', () => {
      renderWithProviders();

      expect(screen.getByText('Export Sections to CSV')).toBeInTheDocument();
      expect(screen.getByText('Search and select sections to export their data to CSV format.')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Search Sections' })).toBeInTheDocument();
      expect(screen.getByText('Selected Sections')).toBeInTheDocument();
      expect(screen.getByText('Available Sections')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      renderWithProviders();

      expect(screen.getByText('Select All')).toBeInTheDocument();
      expect(screen.getByText('Clear Selection')).toBeInTheDocument();
      expect(screen.getByText('Export Selected')).toBeInTheDocument();
      expect(screen.getByText('Export All Sections')).toBeInTheDocument();
    });

    // it('initially shows empty state message', () => {
    //   renderWithProviders();

    //   expect(screen.getByText('Use the search filter above to find sections')).toBeInTheDocument();
    // });
  });

  describe('Section Search and Display', () => {
    it('loads and displays sections when search is performed', async () => {
      renderWithProviders();

      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(useSectionFilterModule.useSectionSearchPage).toHaveBeenCalledWith(
          { deptCode: 'COSC', courseNum: '111' },
          0,
          10
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('section-list')).toBeInTheDocument();
      });
    });

    // it('shows loading state during search', async () => {
    //   // Make the API call hang to test loading state
    //   vi.mocked(fetchFilteredSections.fetchFilteredSections).mockImplementation(
    //     () => new Promise(() => {}) // Never resolves
    //   );

    //   renderWithProviders();

    //   const searchButton = screen.getByTestId('search-button');
    //   fireEvent.click(searchButton);

    //   await waitFor(() => {
    //     expect(screen.getByText('Loading sections...')).toBeInTheDocument();
    //   });
    // });

    // it('handles search API errors gracefully', async () => {
    //   vi.mocked(fetchFilteredSections.fetchFilteredSections).mockRejectedValue(new Error('API Error'));

    //   renderWithProviders();

    //   const searchButton = screen.getByTestId('search-button');
    //   fireEvent.click(searchButton);
    //   await waitFor(() => {
    //     expect(screen.getByText('Failed to fetch sections')).toBeInTheDocument();
    //   });
    // });
  });

  describe('Section Selection', () => {
    beforeEach(async () => {
      renderWithProviders();
      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);
      await waitFor(() => {
        expect(screen.getByTestId('section-list')).toBeInTheDocument();
      });
    });

    it('allows selecting individual sections', async () => {
      const sectionItem = screen.getByTestId('section-item-0');
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('1 of 3 sections selected')).toBeInTheDocument();
      });
    });

    it('allows deselecting sections', async () => {
      // First select a section
      const sectionItem = screen.getByTestId('section-item-0');
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('1 of 3 sections selected')).toBeInTheDocument();
      });

      // Then deselect it
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('0 of 3 sections selected')).toBeInTheDocument();
      });
    });

    it('allows selecting all sections at once', async () => {
      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText('3 of 3 sections selected')).toBeInTheDocument();
      });
    });

    it('allows clearing all selections', async () => {
      // First select all
      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText('3 of 3 sections selected')).toBeInTheDocument();
      });

      // Then clear selection
      const clearSelectionButton = screen.getByText('Clear Selection');
      fireEvent.click(clearSelectionButton);

      await waitFor(() => {
        expect(screen.getByText('0 of 3 sections selected')).toBeInTheDocument();
      });
    });

    it('shows selected section tags', async () => {
      const sectionItem = screen.getByTestId('section-item-0');
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('1 of 3 sections selected')).toBeInTheDocument();
        // Check that the selected section appears in the selected sections area
        const selectedSectionTag = screen.getByText('×');
        expect(selectedSectionTag).toBeInTheDocument();
      });
    });

    it('allows removing selection via section tag', async () => {
      const sectionItem = screen.getByTestId('section-item-0');
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('1 of 3 sections selected')).toBeInTheDocument();
      });

      // Find and click the × button in the selected section tag
      const removeButton = screen.getByText('×');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('0 of 3 sections selected')).toBeInTheDocument();
      });
    });
  });

  describe('CSV Export Functionality', () => {
    beforeEach(async () => {
      renderWithProviders();
      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);
      await waitFor(() => {
        expect(screen.getByTestId('section-list')).toBeInTheDocument();
      });
    });

    it('exports selected sections to CSV', async () => {
      // Select a section first
      const sectionItem = screen.getByTestId('section-item-0');
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('1 of 3 sections selected')).toBeInTheDocument();
      });

      // Export selected sections
      const exportButton = screen.getByText('Export Selected');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(fetchExportSections.fetchExportSectionsAsCSV).toHaveBeenCalledWith([1]);
        expect(fetchExportSections.downloadCSVBlob).toHaveBeenCalled();
      });
    });

    it('exports all sections to CSV', async () => {
      const exportAllButton = screen.getByText('Export All Sections');
      fireEvent.click(exportAllButton);

      await waitFor(() => {
        expect(fetchExportSections.fetchExportAllSectionsAsCSV).toHaveBeenCalled();
        expect(fetchExportSections.downloadCSVBlob).toHaveBeenCalled();
      });
    });

    it('prevents export when no sections are selected', async () => {
      // Ensure no sections are selected by clearing any existing selections
      const clearButton = screen.queryByText('Clear Selection');
      if (clearButton && !clearButton.hasAttribute('disabled')) {
        fireEvent.click(clearButton);
      }

      // Wait for the state to update
      await waitFor(() => {
        const exportButton = screen.getByText('Export Selected');
        expect(exportButton).toBeDisabled();
      });

      // Verify the button is disabled and no API call is made
      const exportButton = screen.getByText('Export Selected');
      expect(exportButton).toBeDisabled();
      expect(fetchExportSections.fetchExportSectionsAsCSV).not.toHaveBeenCalled();
    });

    it('handles export API errors gracefully', async () => {
      vi.mocked(fetchExportSections.fetchExportSectionsAsCSV).mockRejectedValue(new Error('Export failed'));

      // Select a section first
      const sectionItem = screen.getByTestId('section-item-0');
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('1 of 3 sections selected')).toBeInTheDocument();
      });

      // Try to export
      const exportButton = screen.getByText('Export Selected');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export failed: Export failed')).toBeInTheDocument();
      });
    });

    it('shows loading state during export', async () => {
      // Make export API call hang
      vi.mocked(fetchExportSections.fetchExportSectionsAsCSV).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Select a section first
      const sectionItem = screen.getByTestId('section-item-0');
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('1 of 3 sections selected')).toBeInTheDocument();
      });

      // Try to export
      const exportButton = screen.getByText('Export Selected');
      fireEvent.click(exportButton);

      await waitFor(() => {
        // Check that at least one button shows loading state
        const exportingButtons = screen.getAllByText('Exporting...');
        expect(exportingButtons.length).toBeGreaterThan(0);
        expect(exportingButtons[0]).toBeDisabled();
      });
    });
  });

  describe('Button States', () => {
    beforeEach(async () => {
      renderWithProviders();
      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);
      await waitFor(() => {
        expect(screen.getByTestId('section-list')).toBeInTheDocument();
      });
    });

    // it('disables Select All when no sections available', async () => {
    //   // Clear all mocks and set up empty sections for this specific test
    //   const emptyPage: PageableResponse<FilterSectionsProps> = {
    //     content: [],
    //     totalElements: 0,
    //     totalPages: 0,
    //     number: 0,
    //     size: 10,
    //   };

    //   vi.mocked(fetchFilteredSections.fetchFilteredSections).mockResolvedValueOnce(emptyPage);
    //   vi.mocked(convertFilterSectionsToSections).mockReturnValueOnce([]);
 
    //   // Use cleanup and re-render for this specific test case
    //   cleanup();
    //   const queryClient = new QueryClient();
    //   render(
    //     <QueryClientProvider client={queryClient}>
    //     <AuthContext.Provider value={mockAuthContext}>
    //       <MemoryRouter>
    //         <ExportToCSVPage />
    //       </MemoryRouter>
    //     </AuthContext.Provider>
    //     </QueryClientProvider>
    //   );
      
    //   const searchButton = screen.getByTestId('search-button');
    //   fireEvent.click(searchButton);

    //   await waitFor(() => {
    //     expect(screen.getByText('Select All')).toBeDisabled();
    //   });
    // });

    it('disables Clear Selection when no sections selected', () => {
      expect(screen.getByText('Clear Selection')).toBeDisabled();
    });

    it('disables Export Selected when no sections selected', () => {
      expect(screen.getByText('Export Selected')).toBeDisabled();
    });

    it('enables buttons when sections are selected', async () => {
      const sectionItem = screen.getByTestId('section-item-0');
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('Clear Selection')).not.toBeDisabled();
        expect(screen.getByText('Export Selected')).not.toBeDisabled();
      });
    });

    it('disables buttons during loading', async () => {
      // Make export API call hang
      vi.mocked(fetchExportSections.fetchExportSectionsAsCSV).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Select a section and start export
      const sectionItem = screen.getByTestId('section-item-0');
      fireEvent.click(sectionItem);

      await waitFor(() => {
        expect(screen.getByText('1 of 3 sections selected')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export Selected');
      fireEvent.click(exportButton);

      await waitFor(() => {
        // Check that buttons are disabled during loading
        const exportingButtons = screen.getAllByText('Exporting...');
        expect(exportingButtons.length).toBe(2); // Both Export Selected and Export All should show "Exporting..."
        exportingButtons.forEach(button => {
          expect(button).toBeDisabled();
        });
      });
    });
  });

  describe('Additional Coverage Cases', () => {
    it('handles null blob response from fetchExportAllSectionsAsCSV', async () => {
      const { toast } = await import('react-toastify');
      // Mock null blob response
      vi.mocked(fetchExportSections.fetchExportAllSectionsAsCSV).mockResolvedValue(null);

      renderWithProviders();

      const exportAllButton = screen.getByText('Export All Sections');
      fireEvent.click(exportAllButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Export failed. Please try again.');
      });
    });

    it('handles error from fetchExportAllSectionsAsCSV', async () => {
      // Mock error response
      const error = new Error('Network error');
      vi.mocked(fetchExportSections.fetchExportAllSectionsAsCSV).mockRejectedValue(error);

      renderWithProviders();

      const exportAllButton = screen.getByText('Export All Sections');
      fireEvent.click(exportAllButton);

      await waitFor(() => {
        expect(screen.getByText('Export all failed')).toBeInTheDocument();
      });
    });

    it('shows loading state when sections are being fetched', () => {
      vi.mocked(useSectionFilterModule.useSectionSearchPage).mockReturnValue({
        data: undefined,
        isFetching: true,
        isError: false,
        error: null,
        isPending: true,
        isLoading: true,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: false,
        refetch: vi.fn(),
        fetchStatus: 'fetching',
        status: 'pending',
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        isInitialLoading: true,
        isFetched: false,
        isFetchedAfterMount: false,
        isPlaceholderData: false,
        isPaused: false,
        isRefetching: false,
        isStale: false,
      } as any);

      renderWithProviders();

      expect(screen.getByText('Loading sections…')).toBeInTheDocument();
    });

    it('shows error state when section fetch fails', async () => {
      vi.mocked(useSectionFilterModule.useSectionSearchPage).mockReturnValue({
        data: undefined,
        isFetching: false,
        isError: true,
        error: new Error('Network error'),
        isPending: false,
        isLoading: false,
        isLoadingError: true,
        isRefetchError: false,
        isSuccess: false,
        refetch: vi.fn(),
        fetchStatus: 'idle',
        status: 'error',
        dataUpdatedAt: 0,
        errorUpdatedAt: Date.now(),
        failureCount: 1,
        failureReason: new Error('Network error'),
        isInitialLoading: false,
        isFetched: true,
        isFetchedAfterMount: true,
        isPlaceholderData: false,
        isPaused: false,
        isRefetching: false,
        isStale: false,
      } as any);

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch sections')).toBeInTheDocument();
      });
    });

    it('shows empty state when no sections are found', async () => {
      // Mock empty response
      const emptyResponse: PageableResponse<any> = {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
      };

      vi.mocked(useSectionFilterModule.useSectionSearchPage).mockReturnValue({
        data: emptyResponse,
        isFetching: false,
        isError: false,
        error: null,
        isPending: false,
        isLoading: false,
        isLoadingError: false,
        isRefetchError: false,
        isSuccess: true,
        refetch: vi.fn(),
        fetchStatus: 'idle',
        status: 'success',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        isInitialLoading: false,
        isFetched: true,
        isFetchedAfterMount: true,
        isPlaceholderData: false,
        isPaused: false,
        isRefetching: false,
        isStale: false,
      } as any);
      vi.mocked(convertFilterSectionsToSections).mockReturnValue([]);

      renderWithProviders();

      await waitFor(() => {
        expect(screen.getByText('Use the search filter above to find sections')).toBeInTheDocument();
      });
    });
  });
});
