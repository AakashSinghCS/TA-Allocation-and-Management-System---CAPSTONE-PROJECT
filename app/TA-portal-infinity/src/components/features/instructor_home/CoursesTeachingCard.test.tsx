import { render, screen, fireEvent } from '@testing-library/react';
import { CoursesTeachingCard } from './CoursesTeachingCard';
import { vi } from 'vitest';
import type Section from '../../../interfaces/section/Section';

describe('CoursesTeachingCard', () => {
  const mockSections: Section[] = [
    { 
      id: 1, 
      course: { id: 1, deptCode: 'COSC', courseNum: '101', name: 'Intro to Computer Science' }, 
      year: 2025, 
      semester: 'W2', 
      section: '001', 
      type: 'LABORATORY' 
    },
    { 
      id: 2, 
      course: { id: 2, deptCode: 'MATH', courseNum: '200', name: 'Calculus I' }, 
      year: 2025, 
      semester: 'W1', 
      section: '002', 
      type: 'LECTURE' 
    },
    { 
      id: 3, 
      course: { id: 3, deptCode: 'PHYS', courseNum: '121', name: 'Physics I' }, 
      year: 2024, 
      semester: 'S1', 
      section: '001', 
      type: 'TUTORIAL' 
    },
    { 
      id: 4, 
      course: { id: 4, deptCode: 'CHEM', courseNum: '111', name: 'General Chemistry' }, 
      year: 2024, 
      semester: 'S2', 
      section: '003', 
      type: 'LABORATORY' 
    },
    { 
      id: 5, 
      course: { id: 5, deptCode: 'BIOL', courseNum: '101', name: 'Biology Fundamentals' }, 
      year: 2025, 
      semester: 'W2', 
      section: '001', 
      type: 'LECTURE' 
    },
    { 
      id: 6, 
      course: { id: 6, deptCode: 'ENGL', courseNum: '100', name: 'English Composition' }, 
      year: 2025, 
      semester: 'W1', 
      section: '004', 
      type: 'SEMINAR' 
    },
    { 
      id: 7, 
      course: { id: 7, deptCode: 'STAT', courseNum: '200', name: 'Statistics' }, 
      year: 2025, 
      semester: 'S1', 
      section: '002', 
      type: 'LECTURE' 
    }
  ];

  const mockSetVisibleTeaching = vi.fn();

  beforeEach(() => {
    mockSetVisibleTeaching.mockClear();
  });

  describe('Component Structure', () => {
    it('renders component with proper structure', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections.slice(0, 2)}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getByText('Courses Teaching')).toBeInTheDocument();
      
      // Check that outer container has proper styling classes
      const outerContainer = screen.getByText('Courses Teaching').closest('div')?.parentElement;
      expect(outerContainer).toHaveClass('bg-white', 'rounded-lg', 'shadow');
    });

    it('renders header with correct styling', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections.slice(0, 1)}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const header = screen.getByText('Courses Teaching');
      const headerContainer = header.closest('div');
      expect(headerContainer).toHaveClass('rounded-t-lg', 'bg-gray-100', 'w-full', 'px-4', 'pt-3', 'pb-2');
      expect(header).toHaveClass('font-semibold', 'text-gray-700');
    });
  });

  describe('Course List Display', () => {
    it('displays course information correctly for single section', () => {
      render(
        <CoursesTeachingCard
          sections={[mockSections[0]]}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getByText('COSC 101 — Intro to Computer Science')).toBeInTheDocument();
      expect(screen.getByText('2025 W2 | Section 001 | LABORATORY')).toBeInTheDocument();
    });

    it('displays multiple sections correctly', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections.slice(0, 3)}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getByText('COSC 101 — Intro to Computer Science')).toBeInTheDocument();
      expect(screen.getByText('MATH 200 — Calculus I')).toBeInTheDocument();
      expect(screen.getByText('PHYS 121 — Physics I')).toBeInTheDocument();
      
      expect(screen.getByText('2025 W2 | Section 001 | LABORATORY')).toBeInTheDocument();
      expect(screen.getByText('2025 W1 | Section 002 | LECTURE')).toBeInTheDocument();
      expect(screen.getByText('2024 S1 | Section 001 | TUTORIAL')).toBeInTheDocument();
    });

    it('renders list with proper styling', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections.slice(0, 2)}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const list = screen.getByRole('list');
      expect(list).toHaveClass('divide-y', 'divide-gray-300');

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
      listItems.forEach(item => {
        expect(item).toHaveClass('py-2');
      });
    });

    it('handles sections with missing course information gracefully', () => {
      const sectionsWithMissingCourse: Section[] = [
        {
          id: 1,
          year: 2025,
          semester: 'W1',
          section: '001',
          type: 'LECTURE'
        }
      ];

      render(
        <CoursesTeachingCard
          sections={sectionsWithMissingCourse}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getByText('2025 W1 | Section 001 | LECTURE')).toBeInTheDocument();
    });
  });

  describe('Visible Teaching Limit', () => {
    it('displays only visible number of sections', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={3}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getByText('COSC 101 — Intro to Computer Science')).toBeInTheDocument();
      expect(screen.getByText('MATH 200 — Calculus I')).toBeInTheDocument();
      expect(screen.getByText('PHYS 121 — Physics I')).toBeInTheDocument();
      expect(screen.queryByText('CHEM 111 — General Chemistry')).not.toBeInTheDocument();
    });

    it('displays all sections when visibleTeaching is greater than sections length', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections.slice(0, 2)}
          visibleTeaching={10}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getByText('COSC 101 — Intro to Computer Science')).toBeInTheDocument();
      expect(screen.getByText('MATH 200 — Calculus I')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
  });

  describe('View More/Show Less Buttons', () => {
    it('shows View More button when there are more sections than visible', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={3}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const viewMoreButton = screen.getByText('View More');
      expect(viewMoreButton).toBeInTheDocument();
      expect(viewMoreButton).toHaveClass('text-sm', 'font-medium', 'hover:underline');
      expect(viewMoreButton).toHaveStyle('color: rgb(29, 53, 87)');
    });

    it('shows Show Less button when visibleTeaching is greater than 5', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={7}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const showLessButton = screen.getByText('Show Less');
      expect(showLessButton).toBeInTheDocument();
      expect(showLessButton).toHaveClass('text-sm', 'font-medium', 'hover:underline');
      expect(showLessButton).toHaveStyle('color: rgb(79, 142, 219)');
    });

    it('shows both buttons when conditions are met', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={6}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getByText('View More')).toBeInTheDocument();
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });

    it('hides buttons when not needed', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections.slice(0, 3)}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.queryByText('View More')).not.toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('hides View More button when all sections are visible', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={mockSections.length}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.queryByText('View More')).not.toBeInTheDocument();
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('calls setVisibleTeaching with correct value when View More is clicked', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={3}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const viewMoreButton = screen.getByText('View More');
      fireEvent.click(viewMoreButton);

      expect(mockSetVisibleTeaching).toHaveBeenCalledTimes(1);
      expect(mockSetVisibleTeaching).toHaveBeenCalledWith(expect.any(Function));

      // Test the function passed to setVisibleTeaching
      const callArg = mockSetVisibleTeaching.mock.calls[0][0];
      expect(callArg(3)).toBe(7); // prev (3) + 5 = 8, which is min(8, 7) = 7
    });

    it('calls setVisibleTeaching with sections length when View More would exceed total', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections.slice(0, 6)}
          visibleTeaching={4}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const viewMoreButton = screen.getByText('View More');
      fireEvent.click(viewMoreButton);

      const callArg = mockSetVisibleTeaching.mock.calls[0][0];
      expect(callArg(4)).toBe(6); // min(4 + 5, 6) = 6
    });

    it('calls setVisibleTeaching with 5 when Show Less is clicked', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={8}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const showLessButton = screen.getByText('Show Less');
      fireEvent.click(showLessButton);

      expect(mockSetVisibleTeaching).toHaveBeenCalledTimes(1);
      expect(mockSetVisibleTeaching).toHaveBeenCalledWith(5);
    });

    it('handles multiple button clicks correctly', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={6}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      // Click View More
      const viewMoreButton = screen.getByText('View More');
      fireEvent.click(viewMoreButton);

      // Click Show Less
      const showLessButton = screen.getByText('Show Less');
      fireEvent.click(showLessButton);

      expect(mockSetVisibleTeaching).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('renders correctly with empty sections array', () => {
      render(
        <CoursesTeachingCard
          sections={[]}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getByText('Courses Teaching')).toBeInTheDocument();
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      expect(screen.queryByText('View More')).not.toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('handles visibleTeaching value of 0', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={0}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      expect(screen.getByText('View More')).toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('handles single section correctly', () => {
      render(
        <CoursesTeachingCard
          sections={[mockSections[0]]}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.queryByText('View More')).not.toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('handles sections with missing optional fields gracefully', () => {
      const sectionsWithMissingFields: Section[] = [
        {
          id: 1,
          course: { id: 1, deptCode: 'COSC', courseNum: '101', name: 'Test Course' }
        }
      ];

      render(
        <CoursesTeachingCard
          sections={sectionsWithMissingFields}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      expect(screen.getByText('COSC 101 — Test Course')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper list structure for screen readers', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections.slice(0, 3)}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    it('buttons are accessible', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={6}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const viewMoreButton = screen.getByRole('button', { name: 'View More' });
      const showLessButton = screen.getByRole('button', { name: 'Show Less' });

      expect(viewMoreButton).toBeInTheDocument();
      expect(showLessButton).toBeInTheDocument();
    });
  });

  describe('CSS Styling', () => {
    it('applies correct CSS classes to main container', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections.slice(0, 1)}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const mainContainer = screen.getByText('Courses Teaching').closest('div')?.parentElement;
      expect(mainContainer).toHaveClass('bg-white', 'rounded-lg', 'shadow', 'p-0', 'flex', 'flex-col', 'justify-between');
    });

    it('applies correct styling to course information', () => {
      render(
        <CoursesTeachingCard
          sections={[mockSections[0]]}
          visibleTeaching={5}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const courseName = screen.getByText('COSC 101 — Intro to Computer Science');
      const courseDetails = screen.getByText('2025 W2 | Section 001 | LABORATORY');

      expect(courseName).toHaveClass('font-medium', 'text-gray-800');
      expect(courseDetails).toHaveClass('text-xs', 'text-gray-500', 'mt-0.5');
    });

    it('applies correct styling to button container', () => {
      render(
        <CoursesTeachingCard
          sections={mockSections}
          visibleTeaching={6}
          setVisibleTeaching={mockSetVisibleTeaching}
        />
      );

      const viewMoreButton = screen.getByText('View More');
      const buttonContainer = viewMoreButton.closest('div');
      expect(buttonContainer).toHaveClass('mt-2', 'flex', 'justify-end', 'gap-2');
    });
  });
});
