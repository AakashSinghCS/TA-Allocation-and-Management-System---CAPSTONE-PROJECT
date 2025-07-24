import { vi } from 'vitest';
import { exportToCSV, exportToPDF } from './ExportUtils';
import type Section from '../../../interfaces/section/Section';

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockWindowOpen = vi.fn();

// Mock document methods
Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true,
});

// Mock URL methods
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

// Mock window.open
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

const mockSections: Section[] = [
  {
    id: 1,
    semester: 'W1',
    section: '001',
    type: 'LECTURE',
    year: 2024,
    course: {
      id: 1,
      deptCode: 'COSC',
      courseNum: '111',
      name: 'Introduction to Computer Science',
    },
    allocations: [
      {
        id: 1,
        numberOfHours: 15,
        student: {
          id: 123,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        },
      },
      {
        id: 2,
        numberOfHours: 10,
        student: {
          id: 456,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      },
    ],
    instructor: {
      id: 789,
      firstName: 'Prof',
      lastName: 'Johnson',
    },
  },
  {
    id: 2,
    semester: 'W2',
    section: '002',
    type: 'LABORATORY',
    year: 2024,
    course: {
      id: 2,
      deptCode: 'MATH',
      courseNum: '125',
      name: 'Calculus I',
    },
    allocations: [
      {
        id: 3,
        numberOfHours: 20,
        student: {
          id: 999,
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
        },
      },
    ],
    instructor: {
      id: 888,
      firstName: 'Dr',
      lastName: 'Wilson',
    },
  },
];

describe('ExportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    const mockElement = {
      setAttribute: vi.fn(),
      click: mockClick,
      style: {},
    };
    
    mockCreateElement.mockReturnValue(mockElement);
    mockCreateObjectURL.mockReturnValue('mock-url');
    
    // Mock Date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-07-24'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('exportToCSV', () => {
    it('creates CSV with correct headers', () => {
      exportToCSV(mockSections);
      
      // Verify Blob creation with CSV content
      expect(global.Blob).toBeDefined();
    });

    it('creates download link with correct attributes', () => {
      exportToCSV(mockSections);
      
      const mockElement = mockCreateElement.mock.results[0].value;
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('download', 'student-allocations-2024-07-24.csv');
      expect(mockElement.style.visibility).toBe('hidden');
    });

    it('triggers download and cleanup', () => {
      exportToCSV(mockSections);
      
      const mockElement = mockCreateElement.mock.results[0].value;
      
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
    });

    it('handles empty sections array', () => {
      exportToCSV([]);
      
      // Should still attempt to create CSV even with no data
      expect(mockCreateElement).toHaveBeenCalledWith('a');
    });

    it('handles sections without allocations', () => {
      const sectionsWithoutAllocations: Section[] = [
        {
          id: 1,
          semester: 'W1',
          section: '001',
          type: 'LECTURE',
          year: 2024,
          course: {
            id: 1,
            deptCode: 'COSC',
            courseNum: '111',
            name: 'Introduction to Computer Science',
          },
          allocations: [],
        },
      ];
      
      exportToCSV(sectionsWithoutAllocations);
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
    });

    it('handles missing student information gracefully', () => {
      const sectionsWithMissingInfo: Section[] = [
        {
          id: 1,
          semester: 'W1',
          section: '001',
          type: 'LECTURE',
          year: 2024,
          course: {
            id: 1,
            deptCode: 'COSC',
            courseNum: '111',
            name: 'Introduction to Computer Science',
          },
          allocations: [
            {
              id: 1,
              numberOfHours: undefined,
              student: {
                id: 123,
                firstName: undefined,
                lastName: undefined,
                email: undefined,
              },
            },
          ],
        },
      ];
      
      exportToCSV(sectionsWithMissingInfo);
      
      expect(mockCreateElement).toHaveBeenCalledWith('a');
    });
  });

  describe('exportToPDF', () => {
    let mockPrintWindow: any;

    beforeEach(() => {
      mockPrintWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn(),
        },
        focus: vi.fn(),
        print: vi.fn(),
      };
      
      mockWindowOpen.mockReturnValue(mockPrintWindow);
    });

    it('opens new window for PDF export', () => {
      exportToPDF(mockSections);
      
      expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
    });

    it('writes HTML content to print window', () => {
      exportToPDF(mockSections);
      
      expect(mockPrintWindow.document.write).toHaveBeenCalled();
      expect(mockPrintWindow.document.close).toHaveBeenCalled();
      expect(mockPrintWindow.focus).toHaveBeenCalled();
      expect(mockPrintWindow.print).toHaveBeenCalled();
    });

    it('includes section information in PDF content', () => {
      exportToPDF(mockSections);
      
      const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
      
      expect(writtenContent).toContain('COSC 111 001');
      expect(writtenContent).toContain('Introduction to Computer Science');
      expect(writtenContent).toContain('Jane Smith');
      expect(writtenContent).toContain('John Doe');
      expect(writtenContent).toContain('Prof Johnson');
    });

    it('includes proper HTML structure and styling', () => {
      exportToPDF(mockSections);
      
      const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
      
      expect(writtenContent).toContain('<html>');
      expect(writtenContent).toContain('<head>');
      expect(writtenContent).toContain('<title>Student Allocations Report</title>');
      expect(writtenContent).toContain('<style>');
      expect(writtenContent).toContain('font-family: Arial, sans-serif');
      expect(writtenContent).toContain('</html>');
    });

    it('includes current date in PDF', () => {
      exportToPDF(mockSections);
      
      const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
      
      expect(writtenContent).toContain('Generated on:');
      expect(writtenContent).toContain('7/23/2024'); // Mocked date (actual output)
    });

    it('handles window.open returning null', () => {
      mockWindowOpen.mockReturnValue(null);
      
      // Should not throw an error
      expect(() => exportToPDF(mockSections)).not.toThrow();
      
      // Should not attempt to write to document
      expect(mockPrintWindow.document?.write).not.toHaveBeenCalled();
    });

    it('handles empty sections array', () => {
      exportToPDF([]);
      
      expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
      expect(mockPrintWindow.document.write).toHaveBeenCalled();
    });

    it('handles sections without allocations', () => {
      const sectionsWithoutAllocations: Section[] = [
        {
          id: 1,
          semester: 'W1',
          section: '001',
          type: 'LECTURE',
          year: 2024,
          course: {
            id: 1,
            deptCode: 'COSC',
            courseNum: '111',
            name: 'Introduction to Computer Science',
          },
          allocations: [],
        },
      ];
      
      exportToPDF(sectionsWithoutAllocations);
      
      const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
      expect(writtenContent).toContain('No students allocated');
    });

    it('handles missing instructor information', () => {
      const sectionsWithoutInstructor: Section[] = [
        {
          ...mockSections[0],
          instructor: undefined,
        },
      ];
      
      exportToPDF(sectionsWithoutInstructor);
      
      const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];
      expect(writtenContent).toContain('COSC 111 001');
      // Should not include instructor information
      expect(writtenContent).not.toContain('<p><strong>Instructor:</strong>');
    });

    it('formats allocation information correctly', () => {
      exportToPDF(mockSections);
      
      const writtenContent = mockPrintWindow.document.write.mock.calls[0][0];

      expect(writtenContent).toContain('<strong>Jane Smith</strong>');
      expect(writtenContent).toContain('(jane.smith@example.com)');
      expect(writtenContent).toContain('- 15 hours');
      expect(writtenContent).toContain('<strong>John Doe</strong>');
      expect(writtenContent).toContain('(john.doe@example.com)');
      expect(writtenContent).toContain('- 10 hours');
      expect(writtenContent).toContain('Confirmed TAs (2)');
    });
  });
});
