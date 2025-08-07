import { render, screen } from '@testing-library/react';
import { CoursesMissingQualificationsCard } from './CoursesMissingQualificationsCard';
import type Section from '../../../interfaces/section/Section';
import type { QualificationResponse } from '../../../api/instructor/fetchAllInstructorQualifications';

// Mock objects for testing
const mockSection1: Section = {
  id: 1,
  section: "001",
  course: {
    id: 1,
    deptCode: "COSC",
    courseNum: "111",
    name: "Computer Science I"
  }
};

const mockSection2: Section = {
  id: 2,
  section: "002",
  course: { 
    id: 2,
    deptCode: 'MATH', 
    courseNum: '200', 
    name: 'Calculus I' 
  }
};

const mockSection3: Section = {
  id: 3,
  section: "003",
  course: {
    id: 3,
    deptCode: "PHYS",
    courseNum: "101",
    name: "Physics I"
  }
};

const mockQualificationWithSkills: QualificationResponse = {
  section: mockSection1,
  qualifications: [
    { id: 1, description: "Python Programming", deptCode: "COSC" },
    { id: 2, description: "Lab Management", deptCode: "COSC" }
  ]
};

const mockQualificationEmpty: QualificationResponse = {
  section: mockSection2,
  qualifications: []
};

describe('CoursesMissingQualificationsCard', () => {
  const defaultUserId = 'instructor123';

  test('renders with empty sections', () => {
    render(
      <CoursesMissingQualificationsCard 
        sections={[]} 
        qualifications={[]} 
        userId={defaultUserId} 
      />
    );
    
    expect(screen.getByText(/Courses Missing/)).toBeInTheDocument();
  });

  test('renders single section with qualifications', () => {
    render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1]} 
        qualifications={[mockQualificationWithSkills]} 
        userId={defaultUserId} 
      />
    );
    
    expect(screen.getByText(/Courses Missing/)).toBeInTheDocument();
    // Should show 0 missing since mockSection1 has qualifications
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('calculates missing courses correctly', () => {
    render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1, mockSection2]} 
        qualifications={[mockQualificationWithSkills, mockQualificationEmpty]} 
        userId={defaultUserId} 
      />
    );
    
    // Should show 1 missing course (mockSection2 has empty qualifications)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('missing')).toBeInTheDocument();
  });

  test('shows view more functionality with many sections', () => {
    const manySections = Array.from({ length: 6 }, (_, i) => ({
      ...mockSection1,
      id: i + 1,
      course: {
        ...mockSection1.course!,
        id: i + 1,
        courseNum: `${111 + i}`,
      }
    }));

    const manyQualifications = manySections.map(section => ({
      section,
      qualifications: []
    }));

    render(
      <CoursesMissingQualificationsCard 
        sections={manySections} 
        qualifications={manyQualifications} 
        userId={defaultUserId} 
      />
    );
    
    // All sections should be missing qualifications
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  test('handles sections with missing course data', () => {
    const sectionWithMissingCourse: Section = {
      id: 99,
      section: "999",
      course: undefined
    };

    render(
      <CoursesMissingQualificationsCard 
        sections={[sectionWithMissingCourse]} 
        qualifications={[]} 
        userId={defaultUserId} 
      />
    );
    
    // Should show 0 missing since no valid courses
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('calculates qualification percentage correctly', () => {
    render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1]} 
        qualifications={[mockQualificationWithSkills]} 
        userId={defaultUserId} 
      />
    );
    
    // Should show 0% missing when section has qualifications
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('groups courses by unique course ID correctly', () => {
    const duplicateCourseSection: Section = {
      ...mockSection1,
      id: 5,
      section: "005" // Different section but same course
    };

    const qualificationForDuplicate: QualificationResponse = {
      section: duplicateCourseSection,
      qualifications: []
    };

    render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1, duplicateCourseSection]} 
        qualifications={[mockQualificationWithSkills, qualificationForDuplicate]} 
        userId={defaultUserId} 
      />
    );
    
    // Should show 1 missing (both sections are same course, one has empty qualifications)
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('handles sections with empty qualifications array', () => {
    render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection3]} 
        qualifications={[]} 
        userId={defaultUserId} 
      />
    );
    
    // Should show 1 missing when no qualifications provided
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    const { container } = render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1]} 
        qualifications={[mockQualificationWithSkills]} 
        userId={defaultUserId} 
      />
    );
    
    // Check for main container styling
    const cardContainer = container.querySelector('.bg-white.rounded-lg.shadow');
    expect(cardContainer).toBeInTheDocument();
  });

  test('renders progress indicators with correct attributes', () => {
    const { container } = render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1]} 
        qualifications={[mockQualificationWithSkills]} 
        userId={defaultUserId} 
      />
    );
    
    // Should have SVG elements for progress visualization
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('generates correct view details link', () => {
    render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1]} 
        qualifications={[]} 
        userId={defaultUserId} 
      />
    );
    
    const link = screen.getByText('View details');
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toContain(defaultUserId);
  });

  test('handles undefined userId gracefully', () => {
    render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1]} 
        qualifications={[]} 
        userId={undefined} 
      />
    );
    
    const link = screen.getByText('View details');
    expect(link).toBeInTheDocument();
  });

  test('calculates missing percentage correctly for multiple courses', () => {
    const qualificationForSection3: QualificationResponse = {
      section: mockSection3,
      qualifications: []
    };

    render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1, mockSection2, mockSection3]} 
        qualifications={[mockQualificationWithSkills, mockQualificationEmpty, qualificationForSection3]} 
        userId={defaultUserId} 
      />
    );
    
    // Should show 2 missing out of 3 total courses
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('renders SVG circle elements correctly', () => {
    const { container } = render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1]} 
        qualifications={[]} 
        userId={defaultUserId} 
      />
    );
    
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  test('applies correct styling classes for different percentages', () => {
    const { container } = render(
      <CoursesMissingQualificationsCard 
        sections={[mockSection1]} 
        qualifications={[]} 
        userId={defaultUserId} 
      />
    );
    
    // Check SVG container
    const svgContainer = container.querySelector('.relative');
    expect(svgContainer).toBeInTheDocument();
  });
});
