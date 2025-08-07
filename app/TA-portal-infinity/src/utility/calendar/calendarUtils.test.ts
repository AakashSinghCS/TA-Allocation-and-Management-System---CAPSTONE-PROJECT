import { describe, it, expect } from 'vitest';
import { getDayNumber, formatTimeRange } from './calendarUtils';

describe('calendarUtils', () => {
  describe('getDayNumber', () => {
    it('returns correct numbers for short day names', () => {
      expect(getDayNumber('sun')).toBe(0);
      expect(getDayNumber('mon')).toBe(1);
      expect(getDayNumber('tue')).toBe(2);
      expect(getDayNumber('wed')).toBe(3);
      expect(getDayNumber('thu')).toBe(4);
      expect(getDayNumber('fri')).toBe(5);
      expect(getDayNumber('sat')).toBe(6);
    });

    it('returns correct numbers for full day names', () => {
      expect(getDayNumber('sunday')).toBe(0);
      expect(getDayNumber('monday')).toBe(1);
      expect(getDayNumber('tuesday')).toBe(2);
      expect(getDayNumber('wednesday')).toBe(3);
      expect(getDayNumber('thursday')).toBe(4);
      expect(getDayNumber('friday')).toBe(5);
      expect(getDayNumber('saturday')).toBe(6);
    });

    it('is case insensitive', () => {
      expect(getDayNumber('SUN')).toBe(0);
      expect(getDayNumber('Monday')).toBe(1);
      expect(getDayNumber('TUESDAY')).toBe(2);
      expect(getDayNumber('WeDnEsDaY')).toBe(3);
    });

    it('handles whitespace', () => {
      expect(getDayNumber('  mon  ')).toBe(1);
      expect(getDayNumber('\ttuesday\n')).toBe(2);
    });

    it('returns 1 (Monday) for unrecognized days', () => {
      expect(getDayNumber('invalid')).toBe(1);
      expect(getDayNumber('xyz')).toBe(1);
      expect(getDayNumber('123')).toBe(1);
    });

    it('returns 1 (Monday) for undefined input', () => {
      expect(getDayNumber(undefined)).toBe(1);
      expect(getDayNumber()).toBe(1);
    });

    it('returns 1 (Monday) for empty string', () => {
      expect(getDayNumber('')).toBe(1);
      expect(getDayNumber('   ')).toBe(1);
    });

    it('handles various casing combinations', () => {
      expect(getDayNumber('Mon')).toBe(1);
      expect(getDayNumber('MON')).toBe(1);
      expect(getDayNumber('mOn')).toBe(1);
      expect(getDayNumber('Friday')).toBe(5);
      expect(getDayNumber('FRIDAY')).toBe(5);
    });
  });

  describe('formatTimeRange', () => {
    it('formats complete time ranges', () => {
      expect(formatTimeRange('09:00', '10:30')).toBe('09:00 - 10:30');
      expect(formatTimeRange('14:15', '16:45')).toBe('14:15 - 16:45');
    });

    it('handles missing start time', () => {
      expect(formatTimeRange(undefined, '10:30')).toBe(' - 10:30');
      expect(formatTimeRange('', '10:30')).toBe(' - 10:30');
    });

    it('handles missing end time', () => {
      expect(formatTimeRange('09:00', undefined)).toBe('09:00 - ');
      expect(formatTimeRange('09:00', '')).toBe('09:00 - ');
    });

    it('handles both times missing', () => {
      expect(formatTimeRange(undefined, undefined)).toBe(' - ');
      expect(formatTimeRange('', '')).toBe(' - ');
    });

    it('handles no parameters', () => {
      expect(formatTimeRange()).toBe(' - ');
    });

    it('preserves exact time format', () => {
      expect(formatTimeRange('9:00', '10:30')).toBe('9:00 - 10:30');
      expect(formatTimeRange('09:00', '10:30')).toBe('09:00 - 10:30');
      expect(formatTimeRange('9:30 AM', '11:00 AM')).toBe('9:30 AM - 11:00 AM');
    });

    it('handles edge case time formats', () => {
      expect(formatTimeRange('0:00', '23:59')).toBe('0:00 - 23:59');
      expect(formatTimeRange('12:00', '12:00')).toBe('12:00 - 12:00');
    });
  });
});
