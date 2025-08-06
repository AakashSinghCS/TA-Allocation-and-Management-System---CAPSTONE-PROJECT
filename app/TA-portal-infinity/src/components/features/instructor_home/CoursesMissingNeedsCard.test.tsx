import { render, screen, fireEvent } from '@testing-library/react';
import { CoursesMissingNeedsCard } from './CoursesMissingNeedsCard';
import { vi } from 'vitest';
import type Section from '../../../interfaces/section/Section';

const mockSection: Section = {
  id: 1,
  course: { 
    id: 1,
    deptCode: 'COSC', 
    courseNum: '101', 
    name: 'Introduction to Programming' 
  },
  year: 2025,
  semester: 'W2',
  section: '001',
  type: 'LABORATORY'
};

const mockSections: Section[] = [
  mockSection,
  {
    id: 2,
    course: { 
      id: 2,
      deptCode: 'MATH', 
      courseNum: '200', 
      name: 'Calculus I' 
    },
    year: 2025,
    semester: 'W1',
    section: '002',
    type: 'LECTURE'
  },
  {
    id: 3,
    course: { 
      id: 3,
      deptCode: 'COSC', 
      courseNum: '210', 
      name: 'Software Engineering' 
    },
    year: 2025,
    semester: 'W2',
    section: '003',
    type: 'TUTORIAL'
  },
  {
    id: 4,
    course: { 
      id: 4,
      deptCode: 'STAT', 
      courseNum: '230', 
      name: 'Statistics' 
    },
    year: 2025,
    semester: 'W1',
    section: '001',
    type: 'LECTURE'
  }
];

describe('CoursesMissingNeedsCard', () => {
  const mockSetVisibleMissing = vi.fn();

  beforeEach(() => {
    mockSetVisibleMissing.mockClear();
  });

  it('renders missing needs card with title', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={[mockSection]}
        visibleMissing={3}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    expect(screen.getByText('Courses Missing Needs')).toBeInTheDocument();
  });

  it('displays message when no missing needs', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={[]}
        visibleMissing={3}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    expect(screen.getByText('All courses have needs specified.')).toBeInTheDocument();
  });

  it('displays course information correctly', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={[mockSection]}
        visibleMissing={3}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    
    expect(screen.getByText('COSC 101 — Introduction to Programming')).toBeInTheDocument();
    expect(screen.getByText('2025 W2 | Section 001 | LABORATORY')).toBeInTheDocument();
  });

  it('limits displayed sections to visibleMissing count', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={mockSections}
        visibleMissing={2}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    
    // Should show only first 2 sections
    expect(screen.getByText('COSC 101 — Introduction to Programming')).toBeInTheDocument();
    expect(screen.getByText('MATH 200 — Calculus I')).toBeInTheDocument();
    expect(screen.queryByText('COSC 210 — Software Engineering')).not.toBeInTheDocument();
  });

  it('shows "View More" button when there are more sections to display', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={mockSections}
        visibleMissing={2}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    
    const viewMoreButton = screen.getByText('View More');
    expect(viewMoreButton).toBeInTheDocument();
  });

  it('calls setVisibleMissing when "View More" is clicked', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={mockSections}
        visibleMissing={2}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    
    const viewMoreButton = screen.getByText('View More');
    fireEvent.click(viewMoreButton);
    
    expect(mockSetVisibleMissing).toHaveBeenCalledWith(expect.any(Function));
  });

  it('shows "Show Less" button when visibleMissing is greater than 3', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={mockSections}
        visibleMissing={5}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    
    const showLessButton = screen.getByText('Show Less');
    expect(showLessButton).toBeInTheDocument();
  });

  it('calls setVisibleMissing with 3 when "Show Less" is clicked', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={mockSections}
        visibleMissing={5}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    
    const showLessButton = screen.getByText('Show Less');
    fireEvent.click(showLessButton);
    
    expect(mockSetVisibleMissing).toHaveBeenCalledWith(3);
  });

  it('does not show navigation buttons when exactly at the limit', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={mockSections.slice(0, 3)}
        visibleMissing={3}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    
    expect(screen.queryByText('View More')).not.toBeInTheDocument();
    expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
  });

  it('handles sections with missing course information gracefully', () => {
    const sectionWithoutCourse: Section = {
      id: 5,
      course: undefined,
      year: 2025,
      semester: 'W1',
      section: '001',
      type: 'LECTURE'
    };

    render(
      <CoursesMissingNeedsCard
        missingNeeds={[sectionWithoutCourse]}
        visibleMissing={3}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    
    // Should still render section information
    expect(screen.getByText('2025 W1 | Section 001 | LECTURE')).toBeInTheDocument();
  });

  it('increments visibleMissing correctly with "View More" callback', () => {
    const mockSetVisibleMissingForTest = vi.fn();
    
    render(
      <CoursesMissingNeedsCard
        missingNeeds={mockSections}
        visibleMissing={2}
        setVisibleMissing={mockSetVisibleMissingForTest}
      />
    );
    
    const viewMoreButton = screen.getByText('View More');
    fireEvent.click(viewMoreButton);
    
    // Verify the function was called and extract the callback
    expect(mockSetVisibleMissingForTest).toHaveBeenCalledWith(expect.any(Function));
    
    // Test the callback function directly
    const callbackFunction = mockSetVisibleMissingForTest.mock.calls[0][0];
    const result = callbackFunction(2); // previous value was 2
    expect(result).toBe(4); // Should be min(2 + 5, mockSections.length = 4)
  });

  it('applies correct styling classes', () => {
    const { container } = render(
      <CoursesMissingNeedsCard
        missingNeeds={[mockSection]}
        visibleMissing={3}
        setVisibleMissing={mockSetVisibleMissing}
      />
    );
    
    // Check main container classes
    const cardContainer = container.querySelector('.bg-white.rounded-lg.shadow');
    expect(cardContainer).toBeInTheDocument();
    
    // Check header styling
    const header = container.querySelector('.rounded-t-lg.bg-gray-100');
    expect(header).toBeInTheDocument();
  });
});
