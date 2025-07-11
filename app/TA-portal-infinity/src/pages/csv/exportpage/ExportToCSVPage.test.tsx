import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ExportToCSVPage from './ExportToCSVPage';
import { AuthContext } from '../../../context/AuthContext';
import { UserRole } from '../../../interfaces/enum/UserRole';
import * as fetchExportSections from '../../../api/csv/fetchExportSections';
import * as fetchFilteredSections from '../../../api/sectionfilter/fetchFilteredSections';
import { convertFilterSectionsToSections } from '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';

// Mock the converter utility
vi.mock('../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections', () => ({
  convertFilterSectionsToSections: vi.fn(),
}));

// Mock the CSV export API functions
vi.mock('../../../api/csv/fetchExportSections', () => ({
  fetchExportSectionsAsCSV: vi.fn(),
  fetchExportAllSectionsAsCSV: vi.fn(),
  downloadCSVBlob: vi.fn(),
}));

// Mock the section filter API
vi.mock('../../../api/sectionfilter/fetchFilteredSections', () => ({
  fetchFilteredSections: vi.fn(),
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
    sectionDetails: {
      id: 101,
      name: 'Introduction to Programming',
      deptCode: 'COSC',
      courseNum: '111',
      sectionId: 1,
      semester: 'W1',
      section: '001',
      type: 'LECTURE' as const,
      year: 2025,
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
    sectionDetails: {
      id: 101,
      name: 'Introduction to Programming',
      deptCode: 'COSC',
      courseNum: '111',
      sectionId: 2,
      semester: 'W1',
      section: 'L01',
      type: 'LABORATORY' as const,
      year: 2025,
    },
    sectionSchedule: [
      {
        day: 'Wednesday',
        startTime: '14:00',
        endTime: '16:00',
        sectionId: 2,
      }
    ],
    need: undefined,
    hasCompleted: undefined,
    allocations: undefined,
    instructor: undefined,
  },
  {
    sectionDetails: {
      id: 201,
      name: 'Data Structures and Algorithms',
      deptCode: 'COSC',
      courseNum: '221',
      sectionId: 3,
      semester: 'W1',
      section: '001',
      type: 'LECTURE' as const,
      year: 2025,
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

const renderWithProviders = () =>
  render(
    <AuthContext.Provider value={mockAuthContext}>
      <MemoryRouter>
        <ExportToCSVPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('ExportToCSVPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.alert properly
    vi.stubGlobal('alert', vi.fn());
    
    // Setup default successful API responses
    // fetchFilteredSections should return the raw DTO data, not converted sections
    vi.mocked(fetchFilteredSections.fetchFilteredSections).mockResolvedValue(mockCourseSectionScheduleDtos as any);
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

    it('initially shows empty state message', () => {
      renderWithProviders();

      expect(screen.getByText('Use the search filter above to find sections')).toBeInTheDocument();
    });
  });

  describe('Section Search and Display', () => {
    it('loads and displays sections when search is performed', async () => {
      renderWithProviders();

      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(fetchFilteredSections.fetchFilteredSections).toHaveBeenCalledWith({
          deptCode: 'COSC',
          courseNum: '111'
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('section-list')).toBeInTheDocument();
      });
    });

    it('shows loading state during search', async () => {
      // Make the API call hang to test loading state
      vi.mocked(fetchFilteredSections.fetchFilteredSections).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders();

      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Loading sections...')).toBeInTheDocument();
      });
    });

    it('handles search API errors gracefully', async () => {
      vi.mocked(fetchFilteredSections.fetchFilteredSections).mockRejectedValue(new Error('API Error'));

      renderWithProviders();

      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch sections')).toBeInTheDocument();
      });
    });
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
        expect(screen.getByText('Export failed')).toBeInTheDocument();
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

    it('disables Select All when no sections available', async () => {
      // Clear all mocks and set up empty sections for this specific test
      vi.mocked(fetchFilteredSections.fetchFilteredSections).mockResolvedValueOnce([]);
      vi.mocked(convertFilterSectionsToSections).mockReturnValueOnce([]);
      
      // Use cleanup and re-render for this specific test case
      cleanup();
      
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <MemoryRouter>
            <ExportToCSVPage />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      
      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Select All')).toBeDisabled();
      });
    });

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
});
