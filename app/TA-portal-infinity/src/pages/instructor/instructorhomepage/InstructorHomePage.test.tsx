import { render, screen, waitFor } from '@testing-library/react';
import InstructorHomePage from './InstructorHomePage';
import { vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ userId: 1, token: 'fake-token' })
}));

vi.mock('../../../api/instructor/fetchSectionNeedAndAllocations', () => ({
  fetchSectionNeedAndAllocations: vi.fn(),
}));
vi.mock('../../../api/instructor/fetchAllInstructorQualifications', () => ({
  fetchAllInstructorQualifications: vi.fn(),
}));
vi.mock('../../../api/instructor/fetchInstructorDetails', () => ({
  fetchInstructorDetails: vi.fn(),
}));
vi.mock('../../../api/config/fetchDeadlines', () => ({
  fetchDeadlines: vi.fn(),
}));
vi.mock('../../../api/course/sectionfilter/fetchAllExistingYears', () => ({
  fetchAllExistingYears: vi.fn(),
}));

// Import the mocked modules after mocking
import { fetchSectionNeedAndAllocations } from '../../../api/instructor/fetchSectionNeedAndAllocations';
import { fetchAllInstructorQualifications } from '../../../api/instructor/fetchAllInstructorQualifications';
import { fetchInstructorDetails } from '../../../api/instructor/fetchInstructorDetails';
import { fetchDeadlines } from '../../../api/config/fetchDeadlines';
import { fetchAllExistingYears } from '../../../api/course/sectionfilter/fetchAllExistingYears';

describe('InstructorHomePage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set up default mock implementations
    vi.mocked(fetchSectionNeedAndAllocations).mockResolvedValue([]);
    vi.mocked(fetchAllInstructorQualifications).mockResolvedValue([]);
    vi.mocked(fetchInstructorDetails).mockResolvedValue({ firstName: 'Test', lastName: 'User' });
    vi.mocked(fetchDeadlines).mockResolvedValue([]);
    vi.mocked(fetchAllExistingYears).mockResolvedValue(['2024', '2025']);
  });

  afterEach(() => {
    // Clean up any pending async operations
    vi.clearAllTimers();
  });

  it('renders loading initially and loads data', async () => {
    render(<InstructorHomePage />);
    
    // Check initial loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify all mocks were called
    expect(fetchSectionNeedAndAllocations).toHaveBeenCalled();
    expect(fetchInstructorDetails).toHaveBeenCalled();
    expect(fetchDeadlines).toHaveBeenCalled();
  });
});
