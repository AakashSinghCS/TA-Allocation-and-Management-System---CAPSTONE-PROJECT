import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SectionDropdown from '../sectiondropdown/SectionDropdown';

describe('SectionDropdown', () => {
  const sections = ['001', 'L01', '002'];

  it('renders section options and calls onChange when enabled', () => {
    const handleChange = vi.fn();
    render(
      <SectionDropdown
        sections={sections}
        value={null}
        onChange={handleChange}
        mode="small"
        disabled={false}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeEnabled();

    // placeholder and actual options
    expect(screen.getByText('Section')).toBeInTheDocument();
    sections.forEach(sec => expect(screen.getByText(sec)).toBeInTheDocument());

    // simulate selecting
    fireEvent.change(select, { target: { value: 'L01' } });
    expect(handleChange).toHaveBeenCalledWith('L01');
  });

  it('disables the select and applies disabled styles', () => {
    render(
      <SectionDropdown
        sections={sections}
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

  it('applies correct padding for small mode', () => {
    render(
      <SectionDropdown
        sections={sections}
        value={null}
        onChange={() => {}}
        mode="small"
        disabled={false}
      />
    );
    const select = screen.getByRole('combobox');
    // small mode uses px-2 py-1
    expect(select).toHaveClass('px-2');
    expect(select).toHaveClass('py-1');
  });
});
