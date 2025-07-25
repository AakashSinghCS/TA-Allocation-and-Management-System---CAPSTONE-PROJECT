// SectionFilter.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, beforeEach, vi, expect } from 'vitest';

import SectionFilter from './SectionFilter';

// 1) Stub out the API fetches so that GenericAPIContainer instantly has data
vi.mock('../../../../api/course/sectionfilter/fetchAllExistingDeptCodes', () => ({
  fetchAllExistingDeptCodes: () => Promise.resolve(['COSC']),
}));
vi.mock('../../../../api/course/sectionfilter/fetchAllExistingYears', () => ({
  fetchAllExistingYears: () => Promise.resolve([2025]),
}));

// 2) Stub out the GenericAPIContainer to synchronously render its child
vi.mock('../../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ render }: any) =>
    // immediately call render with the shape our component expects
    render({ deptCodes: ['COSC'], years: [2025] }),
}));

// 3) Replace the DropdownContainer with two buttons that simulate deptCode/year changes
vi.mock('../dropdowncontainer/DropdownContainer', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (p: any) => void }) => (
    <div>
      <button
        data-testid="dept-change"
        onClick={() => onChange({ deptCode: 'COSC' })}
      >
        Set Dept
      </button>
      <button
        data-testid="year-change"
        onClick={() => onChange({ year: 2025 })}
      >
        Set Year
      </button>
    </div>
  ),
}));

// 4) Stub DaySelector
vi.mock('../../../ui/section/dayselector/DaySelector', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (d: string) => void }) => (
    <button data-testid="day-change" onClick={() => onChange('Monday')}>
      Set Day
    </button>
  ),
}));

// 5) Stub TimeSelector
vi.mock('../../../ui/section/timeselector/TimeSelector', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (t: { startTime: string; endTime: string }) => void }) => (
    <button
      data-testid="time-change"
      onClick={() => onChange({ startTime: '08:00', endTime: '10:00' })}
    >
      Set Time
    </button>
  ),
}));

describe('SectionFilter', () => {
  let onFilterChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onFilterChange = vi.fn();
  });

  it('calls onFilterChange on mount with all‑null defaults', () => {
    render(
      <MemoryRouter>
        <SectionFilter onFilterChange={onFilterChange} mode="small" />
      </MemoryRouter>
    );

    // The very first call should be with all fields null
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith({
      deptCode: null,
      courseNum: null,
      section: null,
      year: null,
      semester: null,
      name: null,
      type: null,
      day: null,
      startTime: null,
      endTime: null,
    });
  });

  it('updates deptCode and year when DropdownContainer buttons are clicked', () => {
    render(
      <MemoryRouter>
        <SectionFilter onFilterChange={onFilterChange} mode="small" />
      </MemoryRouter>
    );

    // Clear the initial call
    onFilterChange.mockClear();

    // Simulate setting deptCode
    fireEvent.click(screen.getByTestId('dept-change'));
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ deptCode: 'COSC' })
    );

    // Simulate setting year
    fireEvent.click(screen.getByTestId('year-change'));
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ deptCode: 'COSC', year: 2025 })
    );
  });

  it('reveals the type/day/time/name inputs only after toggling and then updates filters', () => {
    render(
      <MemoryRouter>
        <SectionFilter onFilterChange={onFilterChange} mode="small" />
      </MemoryRouter>
    );

    // Clear out mount calls
    onFilterChange.mockClear();

    // 1) Toggle open
    fireEvent.click(screen.getByRole('button', { name: /show section filters/i }))

    // 2) Change the section type via the first <select>
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    // pick the second option (first real type)
    const opt = Array.from(select.options).find(o => o.value !== '');
    if (!opt) throw new Error('No type option found');

    fireEvent.change(select, { target: { value: opt.value } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: opt.value })
    );

    // 3) Day selector
    fireEvent.click(screen.getByTestId('day-change'));
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ day: 'Monday' })
    );

    // 4) Time selector
    fireEvent.click(screen.getByTestId('time-change'));
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ startTime: '08:00', endTime: '10:00' })
    );

    // 5) Name input
    const nameInput = screen.getByPlaceholderText(/Course Name/i);
    fireEvent.change(nameInput, { target: { value: 'Intro to Foo' } });
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Intro to Foo' })
    );
  });
});
