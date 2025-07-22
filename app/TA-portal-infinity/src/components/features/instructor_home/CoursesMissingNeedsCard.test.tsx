import { render, screen } from '@testing-library/react';
import { CoursesMissingNeedsCard } from './CoursesMissingNeedsCard';
import { vi } from 'vitest';

describe('CoursesMissingNeedsCard', () => {
  it('renders missing needs card', () => {
    render(
      <CoursesMissingNeedsCard
        missingNeeds={[{ id: 1, course: { deptCode: 'COSC', courseNum: '101', name: 'Intro' }, year: 2025, semester: 'W2', section: '001', type: 'LABORATORY' }]}
        visibleMissing={3}
        setVisibleMissing={vi.fn()}
      />
    );
    expect(screen.getByText(/Courses Missing Needs/)).toBeInTheDocument();
  });
});
