// StudentTabNav.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import StudentTabNav from './StudentTabNav';

// Mock useAuth to always return a coordinator
vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({ userRoles: ['COORDINATOR'] as const }),
}));

const STUDENT_ID = '123';
const BASE = `/user/taprofile/${STUDENT_ID}`;

// Helper to render at a given path
function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/user/taprofile/:studentId/*" element={<StudentTabNav />} />
      </Routes>
    </MemoryRouter>
  );
}

const ALL_TABS = ['Profile', 'Application', 'Courses Taken', 'Compare'] as const;

describe('StudentTabNav', () => {
  it('renders all tabs for coordinator', () => {
    renderAt(BASE);
    ALL_TABS.forEach(label =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it.each([
    [BASE, 'Profile'],
    [`${BASE}/application`, 'Application'],
    [`${BASE}/coursesTaken`, 'Courses Taken'],
    [`${BASE}/compare`, 'Compare'],
  ] as const)('highlights "%s" → %s tab', (path, activeLabel) => {
    renderAt(path);

    ALL_TABS.forEach(label => {
      const link = screen.getByText(label);
      if (label === activeLabel) {
        expect(link).toHaveClass('border-b-2', 'text-blue-600');
      } else {
        expect(link).not.toHaveClass('border-b-2');
      }
    });
  });
});
