import { render, screen } from '@testing-library/react';
import { CoursesTeachingCard } from './CoursesTeachingCard';
import { vi } from 'vitest';

describe('CoursesTeachingCard', () => {
  it('renders course list', () => {
    render(
      <CoursesTeachingCard
        sections={[{ id: 1, course: { deptCode: 'COSC', courseNum: '101', name: 'Intro' }, year: 2025, semester: 'W2', section: '001', type: 'LABORATORY' }]}
        visibleTeaching={5}
        setVisibleTeaching={vi.fn()}
      />
    );
    expect(screen.getByText(/COSC 101 — Intro/)).toBeInTheDocument();
  });
});
