import { render, screen } from '@testing-library/react';
import { TAAllocationsCard } from './TAAllocationsCard';
import { vi } from 'vitest';

describe('TAAllocationsCard', () => {
  it('renders TA Allocations card', () => {
    render(
      <TAAllocationsCard
        sections={[{ id: 1, course: { deptCode: 'COSC', courseNum: '101', name: 'Intro' }, year: 2025, semester: 'W2', section: '001', type: 'LABORATORY', allocations: [] }]}
        visibleAlloc={3}
        setVisibleAlloc={vi.fn()}
        expandedAlloc={null}
        setExpandedAlloc={vi.fn()}
      />
    );
    expect(screen.getByText(/TA Allocations/)).toBeInTheDocument();
  });
});
