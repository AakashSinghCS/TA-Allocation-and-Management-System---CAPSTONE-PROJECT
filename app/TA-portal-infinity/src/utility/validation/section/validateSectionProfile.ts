
// ---------- regex rules ----------

import type { SectionProfile } from "../../../interfaces/section/Section";
import { looksLikeSqlInjection } from "../sqlinjection/looksLikeSqlInjection";

// 1. "001", "A01", "B2C", up to 3 chars, NO lowercase
const reSectionCode  = /^[A-Z0-9]{3}$/;

// 2. "W1", "W2", "S1", "S2", "F1", "F2"
const reSemester     = /^[WS][12]$/;

// 3.  four-digit year in a sane range
const reYear         = /^(19|20|21)\d{2}$/;

// 4. enum values like "LECTURE", "LABORATORY" (uppercase letters/underscore)
const reType         = /^[A-Z_]+$/;

// same token detector we used for CourseProfile


export interface ValidationResult<T> {
  ok: boolean;
  sanitized: Partial<T>;
  errors: string[];
}

/** Validate & sanitise a SectionProfile (or partial update). */
export function validateSectionProfile(
  payload: Partial<SectionProfile>
): ValidationResult<SectionProfile> {
  const errors: string[] = [];
  const sanitized: Partial<SectionProfile> = {};

  /* ---- section code ---- */
  if (payload.section !== undefined) {
    const raw = payload.section.trim().toUpperCase();
    if (!reSectionCode.test(raw) || looksLikeSqlInjection(raw)) {
      errors.push("Section code must be 1-3 uppercase letters/digits (e.g. 001).");
    } else {
      sanitized.section = raw;
    }
  }

  /* ---- semester ---- */
  if (payload.semester !== undefined) {
    const raw = payload.semester.trim().toUpperCase();
    if (!reSemester.test(raw) || looksLikeSqlInjection(raw)) {
      errors.push('Semester must be one of W1, W2, S1, S2, F1, F2.');
    } else {
      sanitized.semester = raw;
    }
  }

  /* ---- year ---- */
  if (payload.year !== undefined) {
    const raw = String(payload.year).trim();
    if (!reYear.test(raw)) {
      errors.push("Year must be a 4-digit number between 1900-2199.");
    } else {
      sanitized.year = Number(raw);
    }
  }

  /* ---- type ---- */
  if (payload.type !== undefined) {
    const raw = String(payload.type).trim().toUpperCase();
    if (!reType.test(raw) || looksLikeSqlInjection(raw)) {
      errors.push("Type must be a valid SectionType enum literal (uppercase).");
    } else {
      sanitized.type = raw as any;      // cast back to SectionType
    }
  }

  return { ok: errors.length === 0, sanitized, errors };
}
