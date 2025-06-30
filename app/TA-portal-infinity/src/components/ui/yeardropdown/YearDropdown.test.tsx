import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import YearDropdown from '../yeardropdown/YearDropdown';

describe('YearDropdown', () => {
  const years = [2022, 2023, 2024];

  it('renders year options and calls onChange when enabled', () => {
    const handleChange = vi.fn();
    render(
      <YearDropdown
        years={years}
        value={null}
        onChange={handleChange}
        mode="small"
        disabled={false}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeEnabled();

    // placeholder and actual options
    expect(screen.getByText('Year')).toBeInTheDocument();
    years.forEach(y => expect(screen.getByText(String(y))).toBeInTheDocument());

    // simulate selecting
    fireEvent.change(select, { target: { value: '2023' } });
    expect(handleChange).toHaveBeenCalledWith('2023');
  });

  it('disables the select and applies disabled styles', () => {
    render(
      <YearDropdown
        years={years}
        value={null}
        onChange={() => {}}
        mode="large"
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();

    // check disabled styling utilities
    expect(select).toHaveClass('disabled:bg-gray-100');
    expect(select).toHaveClass('disabled:cursor-not-allowed');
  });

  it('applies correct padding for large mode', () => {
    render(
      <YearDropdown
        years={years}
        value={null}
        onChange={() => {}}
        mode="large"
        disabled={false}
      />
    );
    const select = screen.getByRole('combobox');
    // large mode uses px-3 py-2
    expect(select).toHaveClass('px-3');
    expect(select).toHaveClass('py-2');
  });
});
