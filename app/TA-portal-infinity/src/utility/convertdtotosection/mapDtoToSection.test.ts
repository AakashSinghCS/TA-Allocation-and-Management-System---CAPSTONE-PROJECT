import { describe, it, expect } from 'vitest';
import { mapDtoToSection, type SectionDtoWithInstructorId } from './mapDtoToSection';
import type { Course } from '../../interfaces/course/Course';
import type { Instructor } from '../../interfaces/user/Instructor';
import type SectionSchedule from '../../interfaces/section/SectionSchedule';
import type { SectionType } from '../../interfaces/section/SectionDetails';

describe('mapDtoToSection', () => {
  const mockCourse: Course = {
    id: 1,
    name: 'Introduction to Computer Science',
    deptCode: 'COSC',
    courseNum: '101'
  };

  const mockDto: SectionDtoWithInstructorId = {
    id: 10,
    instructorId: 5,
    year: 2024,
    semester: 'W1',
    section: '001',
    type: 'LECTURE' as SectionType,
    course: mockCourse,
    numberOfTAsAllocated: 3
  };

  const mockSchedules: SectionSchedule[] = [
    {
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      sectionId: 10
    },
    {
      day: 'Wednesday',
      startTime: '09:00',
      endTime: '10:30',
      sectionId: 10
    }
  ];

  const mockInstructor: Instructor = {
    id: 5,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    roles: ['INSTRUCTOR']
  };

  describe('complete mapping with instructor', () => {
    it('maps DTO to Section with all fields present', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);

      expect(result).toEqual({
        id: 10,
        year: 2024,
        semester: 'W1',
        section: '001',
        type: 'LECTURE',
        course: {
          id: 1,
          name: 'Introduction to Computer Science',
          deptCode: 'COSC',
          courseNum: '101'
        },
        numberOfTAsAllocated: 3,
        sectionSchedule: mockSchedules,
        instructor: mockInstructor,
        need: undefined,
        hasCompleted: undefined,
        allocations: undefined
      });
    });

    it('preserves all course information', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);

      expect(result.course).toEqual({
        id: 1,
        name: 'Introduction to Computer Science',
        deptCode: 'COSC',
        courseNum: '101'
      });
    });

    it('preserves section schedule array', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);

      expect(result.sectionSchedule).toHaveLength(2);
      expect(result.sectionSchedule).toBeDefined();
      if (result.sectionSchedule) {
        expect(result.sectionSchedule[0]).toEqual({
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:30',
          sectionId: 10
        });
        expect(result.sectionSchedule[1]).toEqual({
          day: 'Wednesday',
          startTime: '09:00',
          endTime: '10:30',
          sectionId: 10
        });
      }
    });
  });

  describe('mapping without instructor', () => {
    it('maps DTO to Section with null instructor', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, null);

      expect(result.instructor).toBeUndefined();
      expect(result.id).toBe(10);
      expect(result.year).toBe(2024);
    });

    it('handles null instructor gracefully', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, null);

      expect(result).toEqual({
        id: 10,
        year: 2024,
        semester: 'W1',
        section: '001',
        type: 'LECTURE',
        course: mockCourse,
        numberOfTAsAllocated: 3,
        sectionSchedule: mockSchedules,
        instructor: undefined,
        need: undefined,
        hasCompleted: undefined,
        allocations: undefined
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty schedule array', () => {
      const result = mapDtoToSection(mockDto, [], mockInstructor);

      expect(result.sectionSchedule).toEqual([]);
      expect(result.sectionSchedule).toHaveLength(0);
    });

    it('handles different section types', () => {
      const labDto = { ...mockDto, type: 'LABORATORY' as SectionType };
      const result = mapDtoToSection(labDto, mockSchedules, mockInstructor);

      expect(result.type).toBe('LABORATORY');
    });

    it('handles zero TAs allocated', () => {
      const dtoWithZeroTAs = { ...mockDto, numberOfTAsAllocated: 0 };
      const result = mapDtoToSection(dtoWithZeroTAs, mockSchedules, mockInstructor);

      expect(result.numberOfTAsAllocated).toBe(0);
    });

    it('preserves all DTO numeric fields', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);

      expect(result.id).toBe(mockDto.id);
      expect(result.year).toBe(mockDto.year);
      expect(result.numberOfTAsAllocated).toBe(mockDto.numberOfTAsAllocated);
    });

    it('preserves all DTO string fields', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);

      expect(result.semester).toBe(mockDto.semester);
      expect(result.section).toBe(mockDto.section);
      expect(result.type).toBe(mockDto.type);
    });

    it('ensures undefined fields remain undefined', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);

      expect(result.need).toBeUndefined();
      expect(result.hasCompleted).toBeUndefined();
      expect(result.allocations).toBeUndefined();
    });
  });

  describe('course object mapping', () => {
    it('maps course ID correctly', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);
      expect(result.course).toBeDefined();
      expect(result.course?.id).toBe(1);
    });

    it('maps course name correctly', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);
      expect(result.course).toBeDefined();
      expect(result.course?.name).toBe('Introduction to Computer Science');
    });

    it('maps department code correctly', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);
      expect(result.course).toBeDefined();
      expect(result.course?.deptCode).toBe('COSC');
    });

    it('maps course number correctly', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);
      expect(result.course).toBeDefined();
      expect(result.course?.courseNum).toBe('101');
    });

    it('handles different course data', () => {
      const differentCourse: Course = {
        id: 99,
        name: 'Advanced Algorithms',
        deptCode: 'MATH',
        courseNum: '542'
      };
      const dtoWithDifferentCourse = { ...mockDto, course: differentCourse };
      
      const result = mapDtoToSection(dtoWithDifferentCourse, mockSchedules, mockInstructor);
      
      expect(result.course).toEqual(differentCourse);
    });
  });

  describe('instructor assignment', () => {
    it('correctly assigns instructor when provided', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, mockInstructor);
      expect(result.instructor).toBe(mockInstructor);
    });

    it('leaves instructor undefined when null', () => {
      const result = mapDtoToSection(mockDto, mockSchedules, null);
      expect(result.instructor).toBeUndefined();
    });

    it('handles instructor with different properties', () => {
      const differentInstructor: Instructor = {
        id: 999,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        roles: ['INSTRUCTOR', 'COORDINATOR']
      };

      const result = mapDtoToSection(mockDto, mockSchedules, differentInstructor);
      expect(result.instructor).toBe(differentInstructor);
      expect(result.instructor?.firstName).toBe('Jane');
    });
  });
});
