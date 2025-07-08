import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import  DeptCodeDropdown  from './DeptCodeDropdown';

describe('<DeptCodeDropdown />', () => {
  const deptCodes = ['COSC', 'MATH'];
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockReset();
  });

  it('renders dropdown with all options', () => {
    render(
      <DeptCodeDropdown
        deptCodeList={deptCodes}
        selected=""
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

    expect(screen.getByRole('option', { name: '— Select Dept —' })).toBeInTheDocument();
    deptCodes.forEach((code) => {
      expect(screen.getByRole('option', { name: code })).toBeInTheDocument();
    });
  });

  it('calls onChange when user selects an option', () => {
    render(
      <DeptCodeDropdown
        deptCodeList={deptCodes}
        selected=""
        onChange={onChange}
      />
    );
    const select = screen.getByLabelText(/department/i);

    // simulate choosing MATH
    fireEvent.change(select, { target: { value: 'MATH' } });
    expect(onChange).toHaveBeenCalledWith('MATH');
  });
});
