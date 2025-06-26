/**
 * Map a day string (short or long, any casing) to 0–6 for Sun–Sat.
 * Defaults to Monday (1) if unrecognized or missing.
 */
export function getDayNumber(day?: string): number {
  if (!day) return 1;
  const key = day.trim().toLowerCase();
  const map: Record<string, number> = {
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
  };
  return map[key] ?? 1;
}

/** 
 * Just formats “HH:mm” ranges as “HH:mm - HH:mm”
 */
export function formatTimeRange(start?: string, end?: string): string {
  return `${start ?? ''} - ${end ?? ''}`;
}