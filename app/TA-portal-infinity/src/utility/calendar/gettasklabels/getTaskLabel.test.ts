import { describe, it, expect } from 'vitest';
import { getTaskLabel } from './getTaskLabel';
import type { AllocationType } from '../../../interfaces/allocation/Allocation';

describe('getTaskLabel', () => {
  it('returns "Grading" for GRADING task', () => {
    expect(getTaskLabel('GRADING')).toBe('Grading');
  });

  it('returns "Lab-Prep" for LAB_PREP task', () => {
    expect(getTaskLabel('LAB_PREP')).toBe('Lab-Prep');
  });

  it('returns "Lab TA" for LAB task', () => {
    expect(getTaskLabel('LAB')).toBe('Lab TA');
  });

  it('returns the original task string for unknown task types', () => {
    const unknownTask = 'UNKNOWN_TASK' as AllocationType;
    expect(getTaskLabel(unknownTask)).toBe('UNKNOWN_TASK');
  });

  it('handles all known AllocationType values', () => {
    const knownTasks: AllocationType[] = ['GRADING', 'LAB_PREP', 'LAB'];
    const expectedLabels = ['Grading', 'Lab-Prep', 'Lab TA'];
    
    knownTasks.forEach((task, index) => {
      expect(getTaskLabel(task)).toBe(expectedLabels[index]);
    });
  });

  it('returns task as-is for custom task types', () => {
    const customTask = 'OFFICE_HOURS' as AllocationType;
    expect(getTaskLabel(customTask)).toBe('OFFICE_HOURS');
  });
});
