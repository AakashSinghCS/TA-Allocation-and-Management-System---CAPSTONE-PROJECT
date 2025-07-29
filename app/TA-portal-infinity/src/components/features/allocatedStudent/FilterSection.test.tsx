import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FilterSection from './FilterSection';
import type Section from '../../../interfaces/section/Section';
import type { Course } from '../../../interfaces/course/Course';

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaFileCsv: () => <div data-testid="csv-icon">CSV</div>,
  FaFilePdf: () => <div data-testid="pdf-icon">PDF</div>,
}));

const mockCourses: Course[] = [
  { id: 1, deptCode: 'COSC', courseNum: '111', name: 'Introduction to Computer Science' },
  { id: 2, deptCode: 'MATH', courseNum: '125', name: 'Calculus I' },
];

const mockSections: Section[] = [
  {
    id: 1,
    semester: 'W1',
    section: '001',
    type: 'LECTURE',
    year: 2024,
    course: mockCourses[0],
    allocations: [
      {
        id: 1,
        numberOfHours: 10,
        student: {
          id: 123,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        },
      },
    ],
    instructor: {
      id: 456,
      firstName: 'Prof',
      lastName: 'Johnson',
    },
  },
];

const defaultProps = {
  sections: mockSections,
  sectionsWithTAs: mockSections,
  courseList: mockCourses,
  existingYears: ['2023', '2024', '2025'],
  selectedCourse: null,
  selectedYear: 2024,
  selectedSemester: 'W1',
  onCourseChange: vi.fn(),
  onYearChange: vi.fn(),
  onSemesterChange: vi.fn(),
  onSearch: vi.fn(),
  onExportCSV: vi.fn(),
  onExportPDF: vi.fn(),
};

describe('FilterSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<FilterSection {...defaultProps} />);
    expect(screen.getByText('Filter Sections')).toBeInTheDocument();
  });

  it('renders all filter controls', () => {
    render(<FilterSection {...defaultProps} />);
    expect(screen.getByLabelText('Course')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toBeInTheDocument();
    expect(screen.getByLabelText('Semester')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('renders course options correctly', () => {
    render(<FilterSection {...defaultProps} />);
    const courseSelect = screen.getByLabelText('Course');
    expect(courseSelect).toBeInTheDocument();
    expect(screen.getByText('All courses')).toBeInTheDocument();
    expect(screen.getByText('COSC 111')).toBeInTheDocument();
    expect(screen.getByText('MATH 125')).toBeInTheDocument();
  });

  it('renders export buttons', () => {
    render(<FilterSection {...defaultProps} />);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  it('calls onCourseChange when course selection changes', () => {
    render(<FilterSection {...defaultProps} />);
    const courseSelect = screen.getByLabelText('Course');

    fireEvent.change(courseSelect, { target: { value: '1' } });
    expect(defaultProps.onCourseChange).toHaveBeenCalledWith(1);
  });

  it('calls onExportCSV when CSV export button is clicked', () => {
    render(<FilterSection {...defaultProps} />);
    const csvButton = screen.getByText('Export CSV');

    fireEvent.click(csvButton);
    expect(defaultProps.onExportCSV).toHaveBeenCalled();
  });

  it('calls onExportPDF when PDF export button is clicked', () => {
    render(<FilterSection {...defaultProps} />);
    const pdfButton = screen.getByText('Export PDF');

    fireEvent.click(pdfButton);
    expect(defaultProps.onExportPDF).toHaveBeenCalled();
  });

  it('disables export buttons when no sections with TAs', () => {
    const propsWithoutTAs = {
      ...defaultProps,
      sectionsWithTAs: [],
    };

    render(<FilterSection {...propsWithoutTAs} />);
    
    const csvButton = screen.getByText('Export CSV');
    const pdfButton = screen.getByText('Export PDF');

    expect(csvButton).toBeDisabled();
    expect(pdfButton).toBeDisabled();
  });

  it('displays correct section count', () => {
    render(<FilterSection {...defaultProps} />);
    expect(screen.getByText('1 total sections | 1 sections with TAs')).toBeInTheDocument();
  });
});
