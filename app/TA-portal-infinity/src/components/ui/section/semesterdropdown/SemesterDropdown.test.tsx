import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SemesterDropdown from './SemesterDropdown';

describe('SemesterDropdown', () => {
  const semesters = ['W1', 'W2', 'S1', 'S2'];

  it('renders semester options and calls onChange when enabled', () => {
    const handleChange = vi.fn();
    render(
      <SemesterDropdown
        semesters={semesters}
        value={null}
        onChange={handleChange}
        mode="small"
        disabled={false}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeEnabled();

    // placeholder and actual options
    expect(screen.getByText('Semester')).toBeInTheDocument();
    semesters.forEach(s => expect(screen.getByText(s)).toBeInTheDocument());

    // simulate selecting
    fireEvent.change(select, { target: { value: 'S1' } });
    expect(handleChange).toHaveBeenCalledWith('S1');
  });

  it('disables the select and applies disabled styles', () => {
    render(
      <SemesterDropdown
        semesters={semesters}
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
      <SemesterDropdown
        semesters={semesters}
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
