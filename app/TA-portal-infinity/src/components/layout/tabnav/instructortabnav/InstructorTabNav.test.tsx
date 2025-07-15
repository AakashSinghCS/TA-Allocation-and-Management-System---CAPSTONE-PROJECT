// InstructorTabNav.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import InstructorTabNav from './InstructorTabNav';

// Mock useAuth to always return coordinator role
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({ userRoles: ['COORDINATOR'] as const }),
}));

const INSTRUCTOR_ID = '42';
const BASE = `/user/instructorprofile/${INSTRUCTOR_ID}` as const;
const ALL_TABS = ['Profile', 'Need', 'Compare'] as const;

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/user/instructorprofile/:instructorId/*" element={<InstructorTabNav />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('InstructorTabNav', () => {
  it('renders Profile, Need, and Compare tabs for coordinator', () => {
    renderAt(BASE);
    ALL_TABS.forEach(label =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it.each([
    [BASE, 'Profile'],
    [`${BASE}/need`, 'Need'],
    [`${BASE}/compare`, 'Compare'],
  ] as const)('highlights "%s" → %s tab', (path, activeLabel) => {
    renderAt(path);

    ALL_TABS.forEach(label => {
      const link = screen.getByText(label);
      if (label === activeLabel) {
        expect(link).toHaveClass('border-b-2', 'text-[#0089b2]');
      } else {
        expect(link).not.toHaveClass('border-b-2');
      }
    });
  });
});
