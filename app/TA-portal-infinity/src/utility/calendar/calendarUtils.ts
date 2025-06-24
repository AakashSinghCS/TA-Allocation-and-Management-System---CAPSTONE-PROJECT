export function getDayNumber(day?: string): number {
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return map[day ?? 'Mon'];
}

export function formatTimeRange(start?: string, end?: string): string {
  return `${start ?? ''} - ${end ?? ''}`;
}
