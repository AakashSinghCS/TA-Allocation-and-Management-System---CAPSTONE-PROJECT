import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SectionFilter from './SectionFilter';
import { MemoryRouter } from "react-router-dom";

// Mock the dept-code fetch so GenericAPIContainer resolves immediately
vi.mock('../../../api/sectionfilter/fetchAllExsitingDeptCodes', () => ({
  fetchAllExistingDeptCodes: () => Promise.resolve([]),
}));

describe('SectionFilter', () => {
  let onFilterChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onFilterChange = vi.fn();
  });

  it('calls onFilterChange with correct values when Filter is clicked', () => {
    render(<MemoryRouter><SectionFilter onFilterChange={onFilterChange} mode="small" /></MemoryRouter>);

    // Type into the search input
    const input = screen.getByPlaceholderText(/Search\.\.\./i);
    fireEvent.change(input, { target: { value: 'COSC 111' } });

    // Click the Filter button
    fireEvent.click(screen.getByRole('button', { name: /filter/i }));

    // Expect onFilterChange to have been called with the current searchQuery and defaults
    expect(onFilterChange).toHaveBeenCalledWith({
      term: '',
      searchQuery: 'COSC 111',
      deptCode: '',
      type: '',
    });
  });
});
