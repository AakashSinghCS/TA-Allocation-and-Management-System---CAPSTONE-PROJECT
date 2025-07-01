import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeptCodeDropdown from '../deptcodedropdown/DeptCodeDropdown';

describe('DeptCodeDropdown', () => {
  const codes = ['COSC', 'MATH', 'PHYS'];

  it('renders department options and updates value on select', () => {
    const handleChange = vi.fn();
    render(
      <DeptCodeDropdown
        deptCodes={codes}
        value={null}
        onChange={handleChange}
        mode="small"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeEnabled();

    // placeholder option
    expect(screen.getByText('Department')).toBeInTheDocument();

    // all options
    codes.forEach(code => {
      expect(screen.getByText(code)).toBeInTheDocument();
    });

    // select MATH
    fireEvent.change(select, { target: { value: 'MATH' } });
    expect(handleChange).toHaveBeenCalledWith('MATH');
  });

  it('applies correct padding for large mode', () => {
    render(
      <DeptCodeDropdown
        deptCodes={codes}
        value={null}
        onChange={() => {}}
        mode="large"
      />
    );

    const select = screen.getByRole('combobox');
    // large mode uses px-3 py-2
    expect(select).toHaveClass('px-3');
    expect(select).toHaveClass('py-2');
  });
});
