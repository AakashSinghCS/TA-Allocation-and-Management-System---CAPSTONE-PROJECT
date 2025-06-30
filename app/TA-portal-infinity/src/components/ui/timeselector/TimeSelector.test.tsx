import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TimeSelector, { timeOptions } from '../timeselector/TimeSelector';

describe('TimeSelector', () => {
  it('renders start and end time selects with options and allows selection', () => {
    render(<TimeSelector mode="small" />);

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);

    const [startSel, endSel] = selects;
    // placeholder options
    expect(screen.getAllByText('Start time')[0]).toBeInTheDocument();
    expect(screen.getAllByText('End time')[0]).toBeInTheDocument();

    // verify first and last options exist in both selects
    expect(screen.getAllByText(timeOptions[0]).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(timeOptions[timeOptions.length - 1]).length).toBeGreaterThanOrEqual(2);

    // select a start time
    fireEvent.change(startSel, { target: { value: '08:00' } });
    expect((startSel as HTMLSelectElement).value).toBe('08:00');

    // select an end time
    fireEvent.change(endSel, { target: { value: '09:30' } });
    expect((endSel as HTMLSelectElement).value).toBe('09:30');
  });

  it('applies correct padding for large mode', () => {
    render(<TimeSelector mode="large" />);

    const selects = screen.getAllByRole('combobox');
    selects.forEach((sel) => {
      // large mode uses px-3 py-2
      expect(sel).toHaveClass('px-3');
      expect(sel).toHaveClass('py-2');
    });
  });
});
