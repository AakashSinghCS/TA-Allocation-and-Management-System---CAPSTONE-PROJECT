// __tests__/AllocationCard.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AllocationCard from './AllocationCard';
import { mockAllocatedSections } from '../../../mocked-objects/allocation/mockAllocations';
import { MemoryRouter } from 'react-router-dom';
import { fetchAllocationById } from '../../../api/allocation/fetchAllocationById';
import { mockStudentJohnDoe } from '../../../mocked-objects/user/mockStudents';
import type { Allocation } from '../../../interfaces/allocation/Allocation';

// 1) Mock fetchAllocationById so that each Allocation includes its allocatedSections
vi.mock('../../../api/allocation/fetchAllocationById', () => ({
  fetchAllocationById: vi.fn((id: number) =>
    // grab the stubs for this allocationId from the mockAllocatedSections
    Promise.resolve({
      id,
      student: mockStudentJohnDoe,
      allocatedSections: mockAllocatedSections.filter(
        (as) => as.allocationId === id
      ),
      status: 'CONFIRMED',
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
        <AllocationCard allocatedSections={[]} sectionId={42} />
      </MemoryRouter>
    );
    expect(screen.getByText(/No Confirmed TAs/i)).toBeInTheDocument();
  });

  it('fetches and renders exactly one Allocation card with the correct stub‑hours badges', async () => {
    // pick a sectionId that actually exists in mockAllocatedSections
    const sectionId = mockAllocatedSections[0].sectionId;

    render(
      <MemoryRouter>
        <AllocationCard
          allocatedSections={mockAllocatedSections}
          sectionId={sectionId}
        />
      </MemoryRouter>
    );

    // 2) It should call fetchAllocationById once for each unique allocationId
    const uniqueIds = Array.from(
      new Set(mockAllocatedSections.map((as) => as.allocationId))
    );
    await waitFor(() => {
      expect(fetchAllocationById).toHaveBeenCalledTimes(uniqueIds.length);
      // spot‑check the first one
      expect(fetchAllocationById).toHaveBeenCalledWith(
        mockAllocatedSections[0].allocationId
      );
    });

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(uniqueIds.length);

    expect(await screen.findByText('John Doe')).toBeInTheDocument();

    expect(screen.getByText('2.5 Lab-Prep Hours')).toBeInTheDocument();
    expect(screen.getByText('2 Grading Hours')).toBeInTheDocument();
  });
});
