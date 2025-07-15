// src/validation/profileValidator.ts
import { looksLikeSqlInjection } from "../sqlinjection/looksLikeSqlInjection";
import type { ValidationResult } from "./validateUserFormData";

const reName  = /^[\p{L}][\p{L}\p{M}\-'. ]{0,49}$/u;         // 1-50 letters (accents ok)
const reEmail = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;   // simple RFC-ish
const rePw    = /^(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/;

const validRoles = new Set(["STUDENT", "INSTRUCTOR", "COORDINATOR"]);
/**
 * Validate a profile edit form for any User-derived type T.
 *
 * @param data  The partial form values (keyed by field name)
 * @param fields  The list of keys you rendered inputs for
 */
export function validateProfileData<T extends Record<string, any>>(
  data: Partial<T>,
  fields: (keyof T)[]
): ValidationResult<T> {
  const fieldErrors: Partial<Record<keyof T, string>> = {};
  const sanitized: Partial<T> = {};
 
  for (const field of fields) {
    const raw = data[field];
    if (raw == null) continue;

    const str = String(raw).trim();
    // ─────── common SQL injection guard ───────
    if (looksLikeSqlInjection(str)) {
      fieldErrors[field] = "Suspicious characters";
      continue;
    }

    switch (field as string) {
      // names: 1–50 letters, accents ok
      case "firstName":
      case "lastName":
        if (!reName.test(str)) {
          fieldErrors[field] = "1–50 letters (accents, – ' allowed)";
        } else {
          sanitized[field] = str as any;
        }
        break;

      // email
      case "email":
        const lower = str.toLowerCase();
        if (!reEmail.test(lower)) {
          fieldErrors[field] = "Invalid e-mail address";
        } else {
          sanitized[field] = lower as any;
        }
        break;

      // password fields (if you allow changing here)
      case "password":
      case "confirmPassword":
        if (!rePw.test(str)) {
          fieldErrors[field] = "≥8 chars, incl. uppercase, digit & symbol";
        } else {
          sanitized[field] = str as any;
        }
        break;

      // numeric IDs with fixed length
      case "studentNum":
      case "employeeNum": {
        const digits = str.replace(/\D/g, "");
        if (!/^\d{8}$/.test(digits)) {
          fieldErrors[field] = "Must be exactly 8 digits";
        } else {
          sanitized[field] = (digits as any);
        }
        break;
      }

      // year: exactly 4 digits
      case "enrollmentYear": {
        const digits = str.replace(/\D/g, "");
        if (!/^\d{4}$/.test(digits)) {
          fieldErrors[field] = "Enter a 4-digit year";
        } else {
          sanitized[field] = Number(digits) as any;
        }
        break;
      }

      // school year: 1 digit
      case "schoolYear": {
        const digits = str.replace(/\D/g, "");
        if (!/^[1-9]$/.test(digits)) {
          fieldErrors[field] = "Enter a 1-digit year";
        } else {
          sanitized[field] = Number(digits) as any;
        }
        break;
      }

      // free-text fields
      case "program":
      case "department":
        if (str.length > 100) {
          fieldErrors[field] = "Too long";
        } else {
          sanitized[field] = str as any;
        }
        break;

      // roles (if present)
      case "role": {
        if (!validRoles.has(str)) {
          fieldErrors[field] = "Invalid role";
        } else {
          sanitized[field] = str as any;
        }
        break;
      }

      default:
        // pass through anything else
        sanitized[field] = raw;
    }
  }

  return {
    ok: Object.keys(fieldErrors).length === 0,
    sanitized,
    fieldErrors,
  };
}
