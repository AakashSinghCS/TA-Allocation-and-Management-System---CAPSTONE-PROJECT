import { render, screen } from '@testing-library/react';
import TAAllocationPage from './AllocationPage';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    token: 'mock-token',
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    userRoles: [],
    userId: 1,
  }),
}));

vi.mock('../../../api/application/FetchApplications', () => ({
  fetchApplications: vi.fn(() => Promise.resolve([])),
}));
vi.mock('../../../api/course/sectionfilter/fetchFilteredSections', () => ({
  fetchFilteredSections: vi.fn(() => Promise.resolve([])),
}));
vi.mock('../../../api/allocation/fetchAllocationByStudent', () => ({
  fetchAllocationsByStudent: vi.fn(() => Promise.resolve([])),
}));

describe('TAAllocationPage', () => {
  it('renders the main headings and panels', () => {
    render(
      <MemoryRouter>
        <TAAllocationPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/TA Allocations/i)).toBeInTheDocument();
    expect(screen.getByText(/Course Filter/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Calendar/i)).toBeInTheDocument();
  });
});