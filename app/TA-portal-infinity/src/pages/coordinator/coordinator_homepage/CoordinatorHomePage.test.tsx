import { render, screen } from '@testing-library/react';
import CoordinatorHomePage from './CoordinatorHomePage';
import * as AuthContext from '../../../context/AuthContext';
import { vi, describe, beforeEach, it, expect } from 'vitest';

vi.mock('../../../api/user/fetchUserDetails', () => ({ fetchUserDetails: vi.fn(() => Promise.resolve({ firstName: 'Test', lastName: 'User' })) }));
vi.mock('../../../api/application/FetchApplications', () => ({ fetchApplications: vi.fn(() => Promise.resolve([])) }));
vi.mock('../../../api/allocation/fetchAllocationByStatus', () => ({ fetchAllocationByStatus: vi.fn(() => Promise.resolve([])) }));
vi.mock('../../../api/course/sectionfilter/fetchFilteredSections', () => ({ fetchFilteredSections: vi.fn(() => Promise.resolve([])) }));
vi.mock('../../../api/question/fetchAllProfileQuestions', () => ({ fetchAllProfileQuestions: vi.fn(() => Promise.resolve([])) }));
vi.mock('../../../api/allocation/fetchAllocationBySectionId', () => ({ fetchAllocationBySectionId: vi.fn(() => Promise.resolve([])) }));
vi.mock('../../../api/allocation/fetchAllocationByApplicationId', () => ({ fetchAllocationByApplicationId: vi.fn(() => Promise.resolve([])) }));
vi.mock('../../../api/config/fetchDeadlines', () => ({ fetchDeadlines: vi.fn(() => Promise.resolve([])) }));

// Mock child components
vi.mock('../../../components/features/co-ordinator_home/SummaryMetrics', () => ({ default: () => <div>SummaryMetrics</div> }));
vi.mock('../../../components/features/co-ordinator_home/RecentApplications', () => ({ default: () => <div>RecentApplications</div> }));
vi.mock('../../../components/features/co-ordinator_home/OfferTasks', () => ({ default: () => <div>OfferTasks</div> }));
vi.mock('../../../components/features/co-ordinator_home/TasksOverview', () => ({ default: () => <div>TasksOverview</div> }));


describe('CoordinatorHomePage', () => {
  beforeEach(() => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      token: 'test',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
      userRoles: [],
      userId: 1,
    });
  });

  it('renders dashboard and welcome message', async () => {
    render(<CoordinatorHomePage />);
    expect(await screen.findByText('My Dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Welcome, Test User')).toBeInTheDocument();
    expect(screen.getByText('SummaryMetrics')).toBeInTheDocument();
    expect(screen.getByText('RecentApplications')).toBeInTheDocument();
    expect(screen.getByText('OfferTasks')).toBeInTheDocument();
    expect(screen.getByText('TasksOverview')).toBeInTheDocument();
  });
});
