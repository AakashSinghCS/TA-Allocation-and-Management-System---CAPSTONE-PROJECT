// __tests__/AllocationCard.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AllocationCard from './AllocationCard';
import { mockAllocatedSections } from '../../../mocked-objects/allocation/mockAllocations';
import { MemoryRouter } from 'react-router-dom';
import { fetchAllocationById } from '../../../api/allocation/fetchAllocationById';
import { mockStudentJohnDoe } from '../../../mocked-objects/user/mockStudents';
import type { Allocation } from '../../../interfaces/allocation/Allocation';

// 1) Mock the API to return a single Allocation object
vi.mock('../../../api/allocation/fetchAllocationById', () => ({
  fetchAllocationById: vi.fn().mockImplementation((id: number) =>
    Promise.resolve({
      id,
      student: mockStudentJohnDoe,
      sectionHours: 6,
      gradingHours: 0,
      labPrepHours: 0,
    } as Allocation)
  ),
}));

describe('AllocationCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows placeholder when no allocations are passed', () => {
    render(
      <MemoryRouter>
        <AllocationCard />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/No Confirmed TAs/i)
    ).toBeInTheDocument();
  });

  it('fetches and renders exactly one Allocation card with correct hours', async () => {
    render(
      <MemoryRouter>
        <AllocationCard allocatedSections={mockAllocatedSections} />
      </MemoryRouter>
    );

    // 2) It should call fetchAllocationById exactly once
    await waitFor(() => {
      expect(fetchAllocationById).toHaveBeenCalledTimes(1);
      expect(fetchAllocationById).toHaveBeenCalledWith(mockAllocatedSections[0].allocationId);
    });

    // 3) There should be exactly one list-item rendered
    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(1);

    // 4) Within that card, you see the student’s name…
    expect(
      await screen.findByText('John Doe')
    ).toBeInTheDocument();

    // …and the three badges with the right counts:
    expect(
      screen.getByText('TA Hours: 6h')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Grading Hours: 0h')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Lab Prep Hours: 0h')
    ).toBeInTheDocument();
  });
});
