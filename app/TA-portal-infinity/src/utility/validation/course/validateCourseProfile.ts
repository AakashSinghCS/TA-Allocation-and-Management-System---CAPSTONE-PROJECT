import type { CourseProfile } from "../../../interfaces/course/Course";
import { looksLikeSqlInjection } from "../sqlinjection/looksLikeSqlInjection";

/** Regex helpers */
const reName       = /^[\w\s\-&,.'()]{1,100}$/i;  // letters, digits & punctuation we expect
const reDeptCode   = /^[A-Z]{4}$/;              // e.g. COSC, MATH
const reCourseNum  = /^[0-9]{3}$/i;         // e.g. 101, 1A, 4YY

export interface ValidationResult<T> {
  ok: boolean;
  sanitized: Partial<T>;
  errors: string[];
}

/**
 * Validate & sanitise a (partial) CourseProfile update.
 *
 * NOTE: This is defence-in-depth; real SQL-injection protection **must** be
 * enforced server-side with parameterised queries or an ORM.
 */
export function validateCourseProfile(
  payload: Partial<CourseProfile>,
  options?: { skipName?: boolean }
): ValidationResult<CourseProfile> {
  const errors: string[] = [];
  const sanitized: Partial<CourseProfile> = {};

  /* ---- course name ---- */
  if (!options?.skipName) {
    if (payload.name !== undefined) {
      const raw = payload.name.trim().replace(/\s+/g, " ");
      if (!raw) {
        errors.push("Course name is required.");
      } else if (!reName.test(raw) || looksLikeSqlInjection(raw)) {
        errors.push("Course name contains invalid characters.");
      } else {
        sanitized.name = raw;
      }
    } else {
      errors.push("Course name is required.");
    }
  }

  /* ---- deptCode ---- */
  if (payload.deptCode !== undefined) {
    const raw = payload.deptCode.trim().toUpperCase();
    if (!raw) {
      errors.push("Department code is required.");
    } else if (!reDeptCode.test(raw) || looksLikeSqlInjection(raw)) {
      errors.push("Department code must be 4 letters (A-Z).");
    } else {
      sanitized.deptCode = raw;
    }
  } else {
    errors.push("Department code is required.");
  }

  /* ---- courseNum ---- */
  if (payload.courseNum !== undefined) {
    const raw = payload.courseNum.trim();
    if (!raw) {
      errors.push("Course number is required.");
    } else if (!reCourseNum.test(raw) || looksLikeSqlInjection(raw)) {
      errors.push("Course number must be 3 numerics (no spaces).");
    } else {
      sanitized.courseNum = raw;
    }
  } else {
    errors.push("Course number is required.");
  }

  return { ok: errors.length === 0, sanitized, errors };
}
