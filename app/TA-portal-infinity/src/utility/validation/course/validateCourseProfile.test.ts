import { describe, it, expect } from 'vitest';
import { validateCourseProfile } from './validateCourseProfile';
import type { CourseProfile } from '../../../interfaces/course/Course';

describe('validateCourseProfile', () => {
  describe('valid course profiles', () => {
    it('accepts valid complete course profile', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Introduction to Computer Science',
        deptCode: 'COSC',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toEqual({
        name: 'Introduction to Computer Science',
        deptCode: 'COSC',
        courseNum: '101'
      });
    });

    it('handles course names with special characters', () => {
      const payload: Partial<CourseProfile> = {
        name: "Advanced Data Structures & Algorithms (Part I)",
        deptCode: 'MATH',
        courseNum: '542'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.name).toBe("Advanced Data Structures & Algorithms (Part I)");
    });

    it('normalizes whitespace in course name', () => {
      const payload: Partial<CourseProfile> = {
        name: '  Data   Structures    ',
        deptCode: 'COSC',
        courseNum: '221'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.name).toBe('Data Structures');
    });

    it('converts deptCode to uppercase', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Calculus I',
        deptCode: 'math',
        courseNum: '100'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.deptCode).toBe('MATH');
    });
  });

  describe('course name validation', () => {
    it('rejects empty course name', () => {
      const payload: Partial<CourseProfile> = {
        name: '',
        deptCode: 'COSC',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course name is required.');
    });

    it('rejects course name with only whitespace', () => {
      const payload: Partial<CourseProfile> = {
        name: '   ',
        deptCode: 'COSC',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course name is required.');
    });

    it('rejects course name that is too long', () => {
      const payload: Partial<CourseProfile> = {
        name: 'a'.repeat(101),
        deptCode: 'COSC',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course name contains invalid characters.');
    });

    it('rejects course name with SQL injection', () => {
      const payload: Partial<CourseProfile> = {
        name: "Computer Science'; DROP TABLE courses--",
        deptCode: 'COSC',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course name contains invalid characters.');
    });

    it('skips name validation when skipName option is true', () => {
      const payload: Partial<CourseProfile> = {
        deptCode: 'COSC',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload, { skipName: true });
      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('requires name when not skipped and undefined', () => {
      const payload: Partial<CourseProfile> = {
        deptCode: 'COSC',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course name is required.');
    });
  });

  describe('deptCode validation', () => {
    it('rejects empty deptCode', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        deptCode: '',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Department code is required.');
    });

    it('rejects deptCode with wrong length', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        deptCode: 'CS',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Department code must be 4 letters (A-Z).');
    });

    it('rejects deptCode with numbers', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        deptCode: 'COS1',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Department code must be 4 letters (A-Z).');
    });

    it('rejects deptCode with SQL injection', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        deptCode: "CO';",
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Department code must be 4 letters (A-Z).');
    });

    it('requires deptCode when undefined', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        courseNum: '101'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Department code is required.');
    });
  });

  describe('courseNum validation', () => {
    it('rejects empty courseNum', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        deptCode: 'COSC',
        courseNum: ''
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course number is required.');
    });

    it('rejects courseNum with wrong length', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        deptCode: 'COSC',
        courseNum: '10'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course number must be 3 numerics (no spaces).');
    });

    it('rejects courseNum with letters', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        deptCode: 'COSC',
        courseNum: '10A'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course number must be 3 numerics (no spaces).');
    });

    it('rejects courseNum with SQL injection', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        deptCode: 'COSC',
        courseNum: "10'"
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course number must be 3 numerics (no spaces).');
    });

    it('requires courseNum when undefined', () => {
      const payload: Partial<CourseProfile> = {
        name: 'Test Course',
        deptCode: 'COSC'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Course number is required.');
    });
  });

  describe('multiple field validation', () => {
    it('collects multiple errors', () => {
      const payload: Partial<CourseProfile> = {
        name: '',
        deptCode: 'CS',
        courseNum: '10'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Course name is required.');
      expect(result.errors).toContain('Department code must be 4 letters (A-Z).');
      expect(result.errors).toContain('Course number must be 3 numerics (no spaces).');
    });

    it('returns empty sanitized object when all fields are invalid', () => {
      const payload: Partial<CourseProfile> = {
        name: '',
        deptCode: 'INVALID',
        courseNum: 'ABC'
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.sanitized).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('handles completely empty payload', () => {
      const result = validateCourseProfile({});
      expect(result.ok).toBe(false);
      expect(result.errors).toHaveLength(3);
    });

    it('trims whitespace from all fields', () => {
      const payload: Partial<CourseProfile> = {
        name: '  Test Course  ',
        deptCode: '  COSC  ',
        courseNum: '  101  '
      };
      
      const result = validateCourseProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized).toEqual({
        name: 'Test Course',
        deptCode: 'COSC',
        courseNum: '101'
      });
    });
  });
});
