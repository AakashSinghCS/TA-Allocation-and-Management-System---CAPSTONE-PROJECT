const sqlTokens = [
  /--/,            // single-line comment
  /\/\*/,          // start of multi-line comment
  /;/,             // statement separator
  /xp_/i,          // SQL Server extended stored procs
  /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b/i
];

export function looksLikeSqlInjection(value: string): boolean {
  return sqlTokens.some(rx => rx.test(value));
}