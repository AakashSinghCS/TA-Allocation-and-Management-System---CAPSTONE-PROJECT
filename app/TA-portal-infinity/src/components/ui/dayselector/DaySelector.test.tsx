import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DaySelector from '../dayselector/DaySelector';

describe('DaySelector', () => {
  it('renders all days as options and allows selection', () => {
    render(<DaySelector mode="small" onChange={vi.fn()}/>);

    const select = screen.getByRole('combobox');
    expect(select).toBeEnabled();

    // placeholder
    expect(screen.getByText('Day')).toBeInTheDocument();

    // all days
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      .forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });

    // select a day
    fireEvent.change(select, { target: { value: 'Thu' } });
    expect((select as HTMLSelectElement).value).toBe('Thu');
  });

  it('applies correct size classes for large mode', () => {
    render(<DaySelector mode="large" onChange={vi.fn()}/>);
    const select = screen.getByRole('combobox');

    // bigStyle = px-3 py-2
    expect(select).toHaveClass('px-3');
    expect(select).toHaveClass('py-2');
  });
});
