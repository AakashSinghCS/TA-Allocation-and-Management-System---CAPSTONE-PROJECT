import { render, screen } from '@testing-library/react';
import InstructorHomePage from './InstructorHomePage';
import { vi } from 'vitest';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ userId: 1, token: 'fake-token' })
}));

vi.mock('../../../api/instructor/fetchAllSectionsAndNeedAndAllocations', () => ({
  fetchAllSectionsAndNeedAndAllocations: vi.fn(() => Promise.resolve([])),
}));
vi.mock('../../../api/instructor/fetchAllInstructorQualifications', () => ({
  fetchAllInstructorQualifications: vi.fn(() => Promise.resolve([])),
}));
vi.mock('../../../api/instructor/fetchInstructorDetails', () => ({
  fetchInstructorDetails: vi.fn(() => Promise.resolve({ firstName: 'Test', lastName: 'User' })),
}));
vi.mock('../../../api/config/fetchDeadlines', () => ({
  fetchDeadlines: vi.fn(() => Promise.resolve([])),
}));

describe('InstructorHomePage', () => {
  it('renders loading initially', () => {
    render(<InstructorHomePage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
