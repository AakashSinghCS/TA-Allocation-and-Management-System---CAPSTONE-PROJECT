import type { UserFormData } from "../../../components/features/user/createuserform/CreateUserForm";

/* ------------------ generic sanitisation helpers ------------------ */
const sqlTokens = [
  /--/, /\/\*/, /;/, /xp_/i,
  /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b/i
];
function looksLikeSqlInjection(v: string) {
  return sqlTokens.some(rx => rx.test(v));
}

/* ------------------ field-specific regexes ------------------ */
const reName  = /^[\p{L}][\p{L}\p{M}\-'. ]{0,49}$/u;         // 1-50 letters (accents ok)
const reEmail = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;   // simple RFC-ish
const rePw    = /^(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).{8,}$/;

const validRoles = new Set(["STUDENT", "INSTRUCTOR", "COORDINATOR"]);

/* ------------------ result shape ------------------ */
export interface ValidationResult<T> {
  ok: boolean;
  sanitized: Partial<T>;
  fieldErrors: Partial<Record<keyof T, string>>;
}

/* ------------------ main validator ------------------ */
export function validateUserFormData(
  data: UserFormData
): ValidationResult<UserFormData> {
  const fieldErrors: ValidationResult<UserFormData>["fieldErrors"] = {};
  const sanitized: Partial<UserFormData> = {};

  // ---------- first name ----------
  const fn = data.firstName.trim();
  if (!reName.test(fn) || looksLikeSqlInjection(fn))
    fieldErrors.firstName = "1-50 letters (accents, – ' allowed)";
  else sanitized.firstName = fn;

  // ---------- last name ----------
  const ln = data.lastName.trim();
  if (!reName.test(ln) || looksLikeSqlInjection(ln))
    fieldErrors.lastName = "1-50 letters (accents, – ' allowed)";
  else sanitized.lastName = ln;

  // ---------- email ----------
  const email = data.email.trim().toLowerCase();
  if (!reEmail.test(email) || looksLikeSqlInjection(email))
    fieldErrors.email = "Invalid e-mail address";
  else sanitized.email = email;

  // ---------- role ----------
  if (!validRoles.has(data.role))
    fieldErrors.role = "Select a valid role";
  else sanitized.role = data.role;

  // ---------- password ----------
  if (!rePw.test(data.password))
    fieldErrors.password =
      "≥8 chars, incl. uppercase, digit & symbol";
  else if (looksLikeSqlInjection(data.password))
    fieldErrors.password = "Suspicious characters in password";
  if (data.password !== data.confirmPassword)
    fieldErrors.confirmPassword = "Passwords do not match";
  if (!fieldErrors.password) sanitized.password = data.password;

  return {
    ok: Object.keys(fieldErrors).length === 0,
    sanitized,
    fieldErrors,
  };
}
