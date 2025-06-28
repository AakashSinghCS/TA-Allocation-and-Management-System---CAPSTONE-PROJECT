import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CourseNumDropdown from '../coursenumdropdown/CourseNumDropdown';

describe('CourseNumDropdown', () => {
  it('renders options and calls onChange with a number', () => {
    const handleChange = vi.fn();
    render(
      <CourseNumDropdown
        courseNums={[10, 20]}
        value={null}
        onChange={handleChange}
        mode="small"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeEnabled();

    // Verify placeholder option and the two options
    expect(screen.getByText('Course Number')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();

    // Simulate selecting "10"
    fireEvent.change(select, { target: { value: '10' } });
    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it('renders disabled state and applies disabled styles', () => {
    const handleChange = vi.fn();
    render(
      <CourseNumDropdown
        courseNums={[5, 6]}
        value={null}
        onChange={handleChange}
        mode="small"
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();

    // Expect disabled utility class on the select
    expect(select).toHaveClass('disabled:bg-gray-100');
    expect(select).toHaveClass('disabled:cursor-not-allowed');
  });
});
