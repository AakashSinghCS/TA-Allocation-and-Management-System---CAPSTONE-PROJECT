import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import SectionCard from './SectionCard';
import type Section from '../../../interfaces/section/Section';

// Mock the StudentAllocationItem component
vi.mock('./StudentAllocationItem', () => ({
  default: ({ allocation }: any) => (
    <div data-testid="student-allocation-item">
      {allocation.student?.firstName} {allocation.student?.lastName} - {allocation.numberOfHours}h
    </div>
  ),
}));

const mockSection: Section = {
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
      gradingHours: 10,
      student: {
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      },
    },
    {
      id: 2,
      gradingHours: 15,
      student: {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
    },
  ],
  instructor: {
    id: 123,
    firstName: 'Prof',
    lastName: 'Johnson',
  },
  need: {
    id: 1,
    numHoursCurrentlyAllocated: 25,
    requiredGradingHours: 30,
  },
};

const mockSectionWithoutAllocations: Section = {
  ...mockSection,
  id: 2,
  allocations: [],
};

const mockSectionWithoutInstructor: Section = {
  ...mockSection,
  id: 3,
  instructor: undefined,
};

const mockSectionWithoutNeed: Section = {
  ...mockSection,
  id: 4,
  need: undefined,
};

describe('SectionCard', () => {
  const renderWithRouter = (section: Section) => {
    return render(
      <BrowserRouter>
        <SectionCard section={section} />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderWithRouter(mockSection);
    expect(screen.getByText('COSC 111 001')).toBeInTheDocument();
  });

  it('displays section information correctly', () => {
    renderWithRouter(mockSection);
    
    // Check course code and section
    expect(screen.getByText('COSC 111 001')).toBeInTheDocument();
    
    // Check course name
    expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument();
    
    // Check section type
    expect(screen.getByText('LECTURE')).toBeInTheDocument();
    
    // Check year
    expect(screen.getByText('2024')).toBeInTheDocument();
    
    // Check semester
    expect(screen.getByText('W1')).toBeInTheDocument();
  });

  it('displays need information when available', () => {
    renderWithRouter(mockSection);
    expect(screen.getByText('30 req. grading hrs')).toBeInTheDocument();
  });

  it('does not display need information when not available', () => {
    renderWithRouter(mockSectionWithoutNeed);
    expect(screen.queryByText(/hrs/)).not.toBeInTheDocument();
  });

  it('displays instructor information when available', () => {
    renderWithRouter(mockSection);
    expect(screen.getByText('Prof Johnson')).toBeInTheDocument();
  });

  it('does not display instructor information when not available', () => {
    renderWithRouter(mockSectionWithoutInstructor);
    expect(screen.queryByText('Prof Johnson')).not.toBeInTheDocument();
  });

  it('displays zero TAs when no allocations', () => {
    renderWithRouter(mockSectionWithoutAllocations);
    expect(screen.getByText('0 Confirmed TAs')).toBeInTheDocument();
    expect(screen.getByText('0 Total Hours')).toBeInTheDocument();
  });

  it('renders StudentAllocationItem components for each allocation', () => {
    renderWithRouter(mockSection);
    
    const allocationItems = screen.getAllByTestId('student-allocation-item');
    expect(allocationItems).toHaveLength(2);
    
  });

  it('displays "no students allocated" message when no allocations', () => {
    renderWithRouter(mockSectionWithoutAllocations);
    expect(screen.getByText('No students allocated to this section')).toBeInTheDocument();
  });

  it('displays "Confirmed TAs" section header', () => {
    renderWithRouter(mockSection);
    expect(screen.getByText('Confirmed TAs')).toBeInTheDocument();
  });

  it('creates correct link to section profile', () => {
    renderWithRouter(mockSection);
    const sectionLink = screen.getByRole('link', { name: 'COSC 111 001' });
    expect(sectionLink).toHaveAttribute('href', '/user/sectionprofile/1');
  });

  it('handles missing course information gracefully', () => {
    const sectionWithoutCourse = {
      ...mockSection,
      course: undefined,
    };
    
    renderWithRouter(sectionWithoutCourse);
    // Should still render without crashing
    expect(screen.getByText('Confirmed TAs')).toBeInTheDocument();
  });

  it('handles missing section number gracefully', () => {
    const sectionWithoutNumber = {
      ...mockSection,
      section: undefined,
    };
    
    renderWithRouter(sectionWithoutNumber);
    // Should still render the course code
    expect(screen.getByText('COSC 111')).toBeInTheDocument();
  });

  it('calculates total hours correctly from multiple allocations', () => {
    const sectionWithDifferentHours: Section = {
    ...mockSection,
    // override allocations so they each carry an allocatedSections[]
    allocations: [
      {
        id: 1,
        student: { id: 1, firstName: 'Jane', lastName: 'Smith' },
        // stub only for this section.id === mockSection.id
        allocatedSections: [
          { id: 11, allocationId: 1, sectionId: mockSection.id!, task: 'GRADING', hours: 5 }
        ],
      },
      {
        id: 2,
        student: { id: 2, firstName: 'John', lastName: 'Doe' },
        allocatedSections: [
          { id: 22, allocationId: 2, sectionId: mockSection.id!, task: 'GRADING', hours: 8 }
        ],
      },
      {
        id: 3,
        student: { id: 3, firstName: 'Alice', lastName: 'Johnson' },
        allocatedSections: [
          { id: 33, allocationId: 3, sectionId: mockSection.id!, task: 'GRADING', hours: 12 }
        ],
      },
    ],
  };
    
    renderWithRouter(sectionWithDifferentHours);
    expect(screen.getByText('3 Confirmed TAs')).toBeInTheDocument();
    expect(screen.getByText('25 Total Hours')).toBeInTheDocument(); 
  });


  it('applies correct CSS classes for styling', () => {
    const { container } = renderWithRouter(mockSection);
    
    // Check main container has correct classes
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-white', 'border', 'border-gray-200', 'rounded-lg', 'shadow-sm');
  });
});
