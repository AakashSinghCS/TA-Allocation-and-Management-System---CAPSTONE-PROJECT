// utility functions for availability and calendar logic
import type { Day } from '../../../../interfaces/application/Application';

export const dayMap: { [k: number]: Day } = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

export const getDateForDay = (day: Day, time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const targetDay = (Object.values(dayMap) as Day[]).indexOf(day);
  const diff = targetDay - now.getDay();
  const dt = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diff,
    hours,
    minutes
  );
  return dt.toISOString();
};

export const colorByDay: Record<Day, string> = {
  SUNDAY:    '#FCD34D',
  MONDAY:    '#F87171',
  TUESDAY:   '#FB923C',
  WEDNESDAY: '#34D399',
  THURSDAY:  '#A78BFA',
  FRIDAY:    '#F472B6',
  SATURDAY:  '#4ADE80',
};
