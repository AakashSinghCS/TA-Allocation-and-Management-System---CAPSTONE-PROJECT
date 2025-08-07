import { describe, it, expect } from 'vitest';
import { validateProfileData } from './validateProfileData';

describe('validateProfileData', () => {
  describe('firstName validation', () => {
    it('accepts valid first names', () => {
      const result = validateProfileData({ firstName: 'John' }, ['firstName']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.firstName).toBe('John');
      expect(result.fieldErrors.firstName).toBeUndefined();
    });

    it('accepts names with accents and special characters', () => {
      const result = validateProfileData({ firstName: "José-María O'Connor" }, ['firstName']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.firstName).toBe("José-María O'Connor");
    });

    it('rejects names that are too long', () => {
      const longName = 'a'.repeat(51);
      const result = validateProfileData({ firstName: longName }, ['firstName']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.firstName).toBe("1–50 letters (accents, – ' allowed)");
    });

    it('rejects names with invalid characters', () => {
      const result = validateProfileData({ firstName: 'John123' }, ['firstName']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.firstName).toBe("1–50 letters (accents, – ' allowed)");
    });

    it('rejects SQL injection attempts', () => {
      const result = validateProfileData({ firstName: "John'; DROP TABLE users--" }, ['firstName']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.firstName).toBe("Suspicious characters");
    });
  });

  describe('lastName validation', () => {
    it('accepts valid last names', () => {
      const result = validateProfileData({ lastName: 'Smith' }, ['lastName']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.lastName).toBe('Smith');
    });

    it('rejects invalid last names', () => {
      const result = validateProfileData({ lastName: 'Smith@#$' }, ['lastName']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.lastName).toBe("1–50 letters (accents, – ' allowed)");
    });
  });

  describe('email validation', () => {
    it('accepts valid email addresses', () => {
      const result = validateProfileData({ email: 'test@example.com' }, ['email']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.email).toBe('test@example.com');
    });

    it('converts email to lowercase', () => {
      const result = validateProfileData({ email: 'TEST@EXAMPLE.COM' }, ['email']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.email).toBe('test@example.com');
    });

    it('rejects invalid email formats', () => {
      const result = validateProfileData({ email: 'invalid-email' }, ['email']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.email).toBe("Invalid e-mail address");
    });
  });

  describe('password validation', () => {
    it('accepts valid passwords', () => {
      const result = validateProfileData({ password: 'Password123!' }, ['password']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.password).toBe('Password123!');
    });

    it('rejects passwords without uppercase', () => {
      const result = validateProfileData({ password: 'password123!' }, ['password']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.password).toBe("≥8 chars, incl. uppercase, digit & symbol");
    });

    it('rejects passwords without digits', () => {
      const result = validateProfileData({ password: 'Password!' }, ['password']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.password).toBe("≥8 chars, incl. uppercase, digit & symbol");
    });

    it('rejects passwords without symbols', () => {
      const result = validateProfileData({ password: 'Password123' }, ['password']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.password).toBe("≥8 chars, incl. uppercase, digit & symbol");
    });

    it('rejects passwords that are too short', () => {
      const result = validateProfileData({ password: 'Pass1!' }, ['password']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.password).toBe("≥8 chars, incl. uppercase, digit & symbol");
    });
  });

  describe('studentNum validation', () => {
    it('accepts valid 8-digit student numbers', () => {
      const result = validateProfileData({ studentNum: '12345678' }, ['studentNum']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.studentNum).toBe('12345678');
    });

    it('strips non-digit characters and validates', () => {
      const result = validateProfileData({ studentNum: '123-456-78' }, ['studentNum']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.studentNum).toBe('12345678');
    });

    it('rejects numbers with wrong length', () => {
      const result = validateProfileData({ studentNum: '1234567' }, ['studentNum']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.studentNum).toBe("Must be exactly 8 digits");
    });
  });

  describe('enrollmentYear validation', () => {
    it('accepts valid 4-digit years', () => {
      const result = validateProfileData({ enrollmentYear: '2024' }, ['enrollmentYear']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.enrollmentYear).toBe(2024);
    });

    it('rejects invalid year formats', () => {
      const result = validateProfileData({ enrollmentYear: '24' }, ['enrollmentYear']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.enrollmentYear).toBe("Enter a 4-digit year");
    });
  });

  describe('schoolYear validation', () => {
    it('accepts valid school years', () => {
      const result = validateProfileData({ schoolYear: '3' }, ['schoolYear']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.schoolYear).toBe(3);
    });

    it('rejects invalid school years', () => {
      const result = validateProfileData({ schoolYear: '0' }, ['schoolYear']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.schoolYear).toBe("Enter a 1-digit year");
    });

    it('rejects multi-digit school years', () => {
      const result = validateProfileData({ schoolYear: '10' }, ['schoolYear']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.schoolYear).toBe("Enter a 1-digit year");
    });
  });

  describe('program and department validation', () => {
    it('accepts valid program names', () => {
      const result = validateProfileData({ program: 'Computer Science' }, ['program']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.program).toBe('Computer Science');
    });

    it('rejects programs that are too long', () => {
      const longProgram = 'a'.repeat(101);
      const result = validateProfileData({ program: longProgram }, ['program']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.program).toBe("Too long");
    });
  });

  describe('role validation', () => {
    it('accepts valid roles', () => {
      const result = validateProfileData({ role: 'STUDENT' }, ['role']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.role).toBe('STUDENT');
    });

    it('rejects invalid roles', () => {
      const result = validateProfileData({ role: 'INVALID_ROLE' }, ['role']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.role).toBe("Invalid role");
    });
  });

  describe('multiple fields validation', () => {
    it('validates multiple fields successfully', () => {
      const data = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        studentNum: '12345678'
      };
      const result = validateProfileData(data, ['firstName', 'lastName', 'email', 'studentNum']);
      expect(result.ok).toBe(true);
      expect(result.sanitized).toEqual({
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        studentNum: '12345678'
      });
    });

    it('collects multiple field errors', () => {
      const data = {
        firstName: 'John123',
        lastName: 'Smith@#$',
        email: 'invalid-email'
      };
      const result = validateProfileData(data, ['firstName', 'lastName', 'email']);
      expect(result.ok).toBe(false);
      expect(result.fieldErrors.firstName).toBeDefined();
      expect(result.fieldErrors.lastName).toBeDefined();
      expect(result.fieldErrors.email).toBeDefined();
    });
  });

  describe('null and undefined handling', () => {
    it('skips null values', () => {
      const result = validateProfileData({ firstName: null }, ['firstName']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.firstName).toBeUndefined();
    });

    it('skips undefined values', () => {
      const result = validateProfileData({ firstName: undefined }, ['firstName']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.firstName).toBeUndefined();
    });
  });

  describe('default field handling', () => {
    it('passes through unknown fields', () => {
      const result = validateProfileData({ customField: 'value' }, ['customField']);
      expect(result.ok).toBe(true);
      expect(result.sanitized.customField).toBe('value');
    });
  });
});
