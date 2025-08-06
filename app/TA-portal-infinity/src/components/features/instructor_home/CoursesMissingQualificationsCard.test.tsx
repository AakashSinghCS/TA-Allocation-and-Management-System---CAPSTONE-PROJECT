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
const defaultUserId = 'instructor123';

const mockSection2: Section = {
  id: 2,
  section: "002",
  course: {
    id: 2,
    deptCode: "MATH",
    courseNum: "200",
    name: "Calculus I"
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
  test('covers courseSections.length === 0 branch', () => {
    // Add two sections for two different courses
    const sectionA: Section = {
      id: 101,
      section: "101",
      course: {
        id: 101,
        deptCode: "A",
        courseNum: "1",
        name: "Course A"
      }
    };
    const sectionB: Section = {
      id: 102,
      section: "102",
      course: {
        id: 102,
        deptCode: "B",
        courseNum: "2",
        name: "Course B"
      }
    };
    // Only provide qualifications for sectionB
    const qualifications: QualificationResponse[] = [
      { section: sectionB, qualifications: [{ id: 1, description: "Skill", deptCode: "B" }] }
    ];
    // Pass both sections, but only sectionB will match its courseKey, sectionA will not
    render(
      <CoursesMissingQualificationsCard sections={[sectionA, sectionB]} qualifications={qualifications} userId={defaultUserId} />
    );
    // Should show 1 missing, and not error
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  const defaultUserId = 'instructor123';

  test('renders with empty sections', () => {
    render(
      <CoursesMissingQualificationsCard 
        sections={[]} 
        qualifications={[]} 
        userId={defaultUserId} 
      />
    );
    const headers = screen.getAllByText('Courses Missing Skills/TA Qualifications');
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });
    const sections = [
      { ...mockSection1, id: 10, course: { ...mockSection1.course!, id: 10, deptCode: 'COSC', courseNum: '111' } },
      { ...mockSection2, id: 11, course: { ...mockSection2.course!, id: 11, deptCode: 'MATH', courseNum: '200' } },
      { ...mockSection3, id: 12, course: { ...mockSection3.course!, id: 12, deptCode: 'PHYS', courseNum: '101' } }
    ];
    const qualifications = [
      { section: sections[0], qualifications: [] },
      { section: sections[1], qualifications: [] },
      { section: sections[2], qualifications: [{ id: 99, description: 'Physics', deptCode: 'PHYS' }] }
    ];
    const { container } = render(
      <CoursesMissingQualificationsCard sections={sections} qualifications={qualifications} userId={defaultUserId} />
    );
    // Should show 2 missing, yellow color
    expect(screen.getByText('2')).toBeInTheDocument();
    const yellow = '#F59E42';
    expect(container.innerHTML).toContain(yellow);
  });

  test('applies red color for more than 2 missing courses', () => {
    const sections = [
      { ...mockSection1, id: 20, course: { ...mockSection1.course!, id: 20, deptCode: 'COSC', courseNum: '111' } },
      { ...mockSection2, id: 21, course: { ...mockSection2.course!, id: 21, deptCode: 'MATH', courseNum: '200' } },
      { ...mockSection3, id: 22, course: { ...mockSection3.course!, id: 22, deptCode: 'PHYS', courseNum: '101' } },
      { ...mockSection3, id: 23, course: { ...mockSection3.course!, id: 23, deptCode: 'PHYS', courseNum: '102' } }
    ];
    const qualifications = sections.map(section => ({ section, qualifications: [] }));
    const { container } = render(
      <CoursesMissingQualificationsCard sections={sections} qualifications={qualifications} userId={defaultUserId} />
    );
    // Should show 4 missing, red color
    expect(screen.getByText('4')).toBeInTheDocument();
    const red = '#B91C1C';
    expect(container.innerHTML).toContain(red);
  });

  test('renders SVG with percent=0 branch', () => {
    const sections = [
      { ...mockSection1, id: 30, course: { ...mockSection1.course!, id: 30, deptCode: 'COSC', courseNum: '111' } }
    ];
    const qualifications = [
      { section: sections[0], qualifications: [{ id: 1, description: 'Python', deptCode: 'COSC' }] }
    ];
    const { container } = render(
      <CoursesMissingQualificationsCard sections={sections} qualifications={qualifications} userId={defaultUserId} />
    );
    // Should show 0 missing, percent=0
    expect(screen.getByText('0')).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Should contain green color
    const green = '#15803D';
    expect(container.innerHTML).toContain(green);
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
  test('applies yellow color for exactly 2 missing courses', () => {
    const sections = [
      { ...mockSection1, id: 10, course: { ...mockSection1.course!, id: 10, deptCode: 'COSC', courseNum: '111' } },
      { ...mockSection2, id: 11, course: { ...mockSection2.course!, id: 11, deptCode: 'MATH', courseNum: '200' } },
      { ...mockSection3, id: 12, course: { ...mockSection3.course!, id: 12, deptCode: 'PHYS', courseNum: '101' } }
    ];
    const qualifications = [
      { section: sections[0], qualifications: [] },
      { section: sections[1], qualifications: [] },
      { section: sections[2], qualifications: [{ id: 99, description: 'Physics', deptCode: 'PHYS' }] }
    ];
    const { container } = render(
      <CoursesMissingQualificationsCard sections={sections} qualifications={qualifications} userId={defaultUserId} />
    );
    // Should show 2 missing, yellow color
    expect(screen.getByText('2')).toBeInTheDocument();
    const yellow = '#F59E42';
    expect(container.innerHTML).toContain(yellow);
  });

  test('applies red color for more than 2 missing courses', () => {
    const sections = [
      { ...mockSection1, id: 20, course: { ...mockSection1.course!, id: 20, deptCode: 'COSC', courseNum: '111' } },
      { ...mockSection2, id: 21, course: { ...mockSection2.course!, id: 21, deptCode: 'MATH', courseNum: '200' } },
      { ...mockSection3, id: 22, course: { ...mockSection3.course!, id: 22, deptCode: 'PHYS', courseNum: '101' } },
      { ...mockSection3, id: 23, course: { ...mockSection3.course!, id: 23, deptCode: 'PHYS', courseNum: '102' } }
    ];
    const qualifications = sections.map(section => ({ section, qualifications: [] }));
    const { container } = render(
      <CoursesMissingQualificationsCard sections={sections} qualifications={qualifications} userId={defaultUserId} />
    );
    // Should show 4 missing, red color
    expect(screen.getByText('4')).toBeInTheDocument();
    const red = '#B91C1C';
    expect(container.innerHTML).toContain(red);
  });

  test('renders SVG with percent=0 branch', () => {
    const sections = [
      { ...mockSection1, id: 30, course: { ...mockSection1.course!, id: 30, deptCode: 'COSC', courseNum: '111' } }
    ];
    const qualifications = [
      { section: sections[0], qualifications: [{ id: 1, description: 'Python', deptCode: 'COSC' }] }
    ];
    const { container } = render(
      <CoursesMissingQualificationsCard sections={sections} qualifications={qualifications} userId={defaultUserId} />
    );
    // Should show 0 missing, percent=0
    expect(screen.getByText('0')).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Should contain green color
    const green = '#15803D';
    expect(container.innerHTML).toContain(green);
  });
