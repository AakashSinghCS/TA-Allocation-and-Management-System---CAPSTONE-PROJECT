// __tests__/StudentAllocationItem.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentAllocationItem from './StudentAllocationItem';
import type { Allocation, AllocatedSection } from '../../../interfaces/allocation/Allocation';

describe('StudentAllocationItem', () => {
  const TEST_SECTION_ID = 2;

  const mockAllocation: Allocation = {
    id: 1,
    student: {
      id: 10,
      firstName: 'Foo',
      lastName: 'Bar',
      email: 'foo@bar.com',
    },
    allocatedSections: [
      { id: 101, allocationId: 1, sectionId: TEST_SECTION_ID, task: 'GRADING', hours: 2 },
      { id: 102, allocationId: 1, sectionId: TEST_SECTION_ID, task: 'LAB_PREP', hours: 1 },
      // stub for a different section, should be ignored:
      { id: 103, allocationId: 1, sectionId: 3, task: 'GRADING', hours: 5 },
    ],
  };

  const renderItem = (sectionId: number) =>
    render(
      <MemoryRouter>
        <StudentAllocationItem allocation={mockAllocation} sectionId={sectionId} />
      </MemoryRouter>
    );

  it('renders student initials and name link', () => {
    renderItem(TEST_SECTION_ID);
    // initials
    expect(screen.getByText('FB')).toBeInTheDocument();
    // name + correct href
    const link = screen.getByRole('link', { name: 'Foo Bar' });
    expect(link).toHaveAttribute('href', '/user/profile/10');
  });

  it('displays student email when provided', () => {
    renderItem(TEST_SECTION_ID);
    expect(screen.getByText('foo@bar.com')).toBeInTheDocument();
  });

  it('renders only the badges for this section', () => {
    renderItem(TEST_SECTION_ID);
    // shows the two matching stubs
    expect(screen.getByText('2 Grading Hours')).toBeInTheDocument();
    expect(screen.getByText('1 Lab Prep Hours')).toBeInTheDocument();
    // does not show the stub for sectionId 3
    expect(screen.queryByText('5 Grading Hours')).not.toBeInTheDocument();
  });

  it('renders no badges if there are no stubs for the section', () => {
    renderItem(999); // sectionId with no stubs
    expect(screen.queryByText(/Hours/)).toBeNull();
  });
});
