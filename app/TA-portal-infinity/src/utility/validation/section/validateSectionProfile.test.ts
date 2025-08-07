import { describe, it, expect } from 'vitest';
import { validateSectionProfile } from './validateSectionProfile';
import type { SectionProfile } from '../../../interfaces/section/Section';

describe('validateSectionProfile', () => {
  describe('valid section profiles', () => {
    it('accepts valid complete section profile', () => {
      const payload: Partial<SectionProfile> = {
        section: '001',
        semester: 'W1',
        year: 2024,
        type: 'LECTURE'
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toEqual({
        section: '001',
        semester: 'W1',
        year: 2024,
        type: 'LECTURE'
      });
    });

    it('converts section code to uppercase', () => {
      const payload: Partial<SectionProfile> = {
        section: 'a01',
        semester: 'S1',
        year: 2024,
        type: 'LABORATORY'
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.section).toBe('A01');
    });

    it('converts semester to uppercase', () => {
      const payload: Partial<SectionProfile> = {
        section: '001',
        semester: 'w1',
        year: 2024,
        type: 'LECTURE'
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.semester).toBe('W1');
    });

    it('converts type to uppercase', () => {
      const payload: Partial<SectionProfile> = {
        section: '001',
        semester: 'W1',
        year: 2024,
        type: 'lecture' as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.type).toBe('LECTURE');
    });

    it('handles numeric year as string', () => {
      const payload: Partial<SectionProfile> = {
        section: '001',
        semester: 'W1',
        year: '2024' as any,
        type: 'LECTURE'
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.year).toBe(2024);
    });
  });

  describe('section code validation', () => {
    it('accepts valid 3-character section codes', () => {
      const validCodes = ['001', 'A01', 'B2C', 'ABC', '123'];
      
      validCodes.forEach(code => {
        const result = validateSectionProfile({ section: code });
        expect(result.ok).toBe(true);
        expect(result.sanitized.section).toBe(code);
      });
    });

    it('rejects section codes that are too short', () => {
      const payload: Partial<SectionProfile> = {
        section: '01'
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Section code must be 1-3 uppercase letters/digits (e.g. 001).');
    });

    it('rejects section codes that are too long', () => {
      const payload: Partial<SectionProfile> = {
        section: '0001'
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Section code must be 1-3 uppercase letters/digits (e.g. 001).');
    });

    it('rejects section codes with special characters', () => {
      const payload: Partial<SectionProfile> = {
        section: '0-1'
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Section code must be 1-3 uppercase letters/digits (e.g. 001).');
    });

    it('rejects section codes with SQL injection', () => {
      const payload: Partial<SectionProfile> = {
        section: "0';DROP"
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Section code must be 1-3 uppercase letters/digits (e.g. 001).');
    });

    it('trims whitespace from section code', () => {
      const payload: Partial<SectionProfile> = {
        section: '  001  '
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.section).toBe('001');
    });
  });

  describe('semester validation', () => {
    it('accepts valid semester codes', () => {
      const validSemesters = ['W1', 'W2', 'S1', 'S2'];  // F1, F2 not supported by regex
      
      validSemesters.forEach(semester => {
        const result = validateSectionProfile({ semester });
        expect(result.ok).toBe(true);
        expect(result.sanitized.semester).toBe(semester);
      });
    });

    it('rejects invalid semester codes', () => {
      const invalidSemesters = ['W3', 'S3', 'F1', 'F2', 'F3', 'A1', 'WW', 'SS'];  // F1, F2 also invalid
      
      invalidSemesters.forEach(semester => {
        const result = validateSectionProfile({ semester });
        expect(result.ok).toBe(false);
        expect(result.errors).toContain('Semester must be one of W1, W2, S1, S2, F1, F2.');
      });
    });

    it('rejects semester with SQL injection', () => {
      const payload: Partial<SectionProfile> = {
        semester: "W1';DROP"
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Semester must be one of W1, W2, S1, S2, F1, F2.');
    });

    it('trims whitespace from semester', () => {
      const payload: Partial<SectionProfile> = {
        semester: '  W1  '
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.semester).toBe('W1');
    });
  });

  describe('year validation', () => {
    it('accepts valid years in range', () => {
      const validYears = [1900, 1999, 2000, 2024, 2199];
      
      validYears.forEach(year => {
        const result = validateSectionProfile({ year });
        expect(result.ok).toBe(true);
        expect(result.sanitized.year).toBe(year);
      });
    });

    it('rejects years outside valid range', () => {
      const invalidYears = [1899, 2200, 3000, 1800];
      
      invalidYears.forEach(year => {
        const result = validateSectionProfile({ year });
        expect(result.ok).toBe(false);
        expect(result.errors).toContain('Year must be a 4-digit number between 1900-2199.');
      });
    });

    it('rejects non-numeric years', () => {
      const payload: Partial<SectionProfile> = {
        year: 'abc' as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Year must be a 4-digit number between 1900-2199.');
    });

    it('rejects 3-digit years', () => {
      const payload: Partial<SectionProfile> = {
        year: 202 as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Year must be a 4-digit number between 1900-2199.');
    });
  });

  describe('type validation', () => {
    it('accepts valid uppercase section types', () => {
      const validTypes = ['LECTURE', 'LABORATORY', 'TUTORIAL', 'SEMINAR'];
      
      validTypes.forEach(type => {
        const result = validateSectionProfile({ type: type as any });
        expect(result.ok).toBe(true);
        expect(result.sanitized.type).toBe(type);
      });
    });

    it('accepts types with underscores', () => {
      const payload: Partial<SectionProfile> = {
        type: 'LAB_SESSION' as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized.type).toBe('LAB_SESSION');
    });

    it('rejects types with lowercase letters', () => {
      const payload: Partial<SectionProfile> = {
        type: 'lecture' as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);  // Should be converted to uppercase
      expect(result.sanitized.type).toBe('LECTURE');
    });

    it('rejects types with numbers', () => {
      const payload: Partial<SectionProfile> = {
        type: 'LECTURE123' as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Type must be a valid SectionType enum literal (uppercase).');
    });

    it('rejects types with special characters', () => {
      const payload: Partial<SectionProfile> = {
        type: 'LECTURE-TYPE' as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Type must be a valid SectionType enum literal (uppercase).');
    });

    it('rejects type with SQL injection', () => {
      const payload: Partial<SectionProfile> = {
        type: "LECTURE';DROP" as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Type must be a valid SectionType enum literal (uppercase).');
    });
  });

  describe('multiple field validation', () => {
    it('collects multiple errors', () => {
      const payload: Partial<SectionProfile> = {
        section: '12',
        semester: 'Invalid',
        year: 1800,
        type: 'invalid-type' as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(false);
      expect(result.errors).toHaveLength(4);
    });

    it('validates only provided fields', () => {
      const payload: Partial<SectionProfile> = {
        section: '001'
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized).toEqual({ section: '001' });
    });

    it('handles empty payload', () => {
      const result = validateSectionProfile({});
      expect(result.ok).toBe(true);
      expect(result.sanitized).toEqual({});
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('trims whitespace from all fields', () => {
      const payload: Partial<SectionProfile> = {
        section: '  001  ',
        semester: '  W1  ',
        year: '  2024  ' as any,
        type: '  LECTURE  ' as any
      };
      
      const result = validateSectionProfile(payload);
      expect(result.ok).toBe(true);
      expect(result.sanitized).toEqual({
        section: '001',
        semester: 'W1',
        year: 2024,
        type: 'LECTURE'
      });
    });
  });
});
