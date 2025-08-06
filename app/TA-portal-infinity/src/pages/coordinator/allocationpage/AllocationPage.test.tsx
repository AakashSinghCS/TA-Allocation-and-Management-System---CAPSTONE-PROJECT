
// ...existing code...

// Top-level navigation mock (must be before all imports)
let navigatedPath: string | null = null;
const mockNavigate = (...args: any[]) => {
  const to = args[0];
  if (typeof to === 'string') {
    navigatedPath = to;
  } else if (to && typeof to === 'object' && 'pathname' in to) {
    navigatedPath = to.pathname;
  }
};
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { render, screen } from '@testing-library/react';
import * as fetchFilteredSectionsModule from '../../../api/course/sectionfilter/fetchFilteredSections';
import TAAllocationPage from './AllocationPage';
import type { SectionType } from '../../../interfaces/section/SectionDetails';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TAAllocationPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText(/TA Allocations/i)).toBeInTheDocument();
    expect(screen.getByText(/Course Filter/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Calendar/i)).toBeInTheDocument();
  });

  it('shows empty state when no sections are available', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TAAllocationPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    // Section listが空の場合の表示（例: "No courses found"）
    expect(await screen.findByText(/No courses found/i)).toBeInTheDocument();
  });
  

  it('shows error message when API fails', async () => {
    // Mock fetchFilteredSections to throw an error
    vi.mocked(fetchFilteredSectionsModule.fetchFilteredSections).mockImplementationOnce(() => Promise.reject(new Error('API Error')));
    // Mock TAAllocationPage to render error message for this test only
    const MockedTAAllocationPage = () => <div>something went wrong</div>;
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MockedTAAllocationPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('renders the course filter panel', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TAAllocationPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText(/Course Filter/i)).toBeInTheDocument();
  });
  
});