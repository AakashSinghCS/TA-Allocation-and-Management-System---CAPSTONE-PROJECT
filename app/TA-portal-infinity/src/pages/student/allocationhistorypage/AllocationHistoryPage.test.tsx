import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AllocationHistoryPage from './AllocationHistoryPage';
import * as fetchStudentAllocationHistoryModule from '../../../api/student/allocation/fetchStudentAllocationHistory';
import * as fetchUserDetailsModule from '../../../api/user/fetchUserDetails';

// Mock the API modules
vi.mock('../../../api/student/allocation/fetchStudentAllocationHistory');
vi.mock('../../../api/user/fetchUserDetails');

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ userId: '123' })),
    useNavigate: vi.fn(() => vi.fn())
  };
});

// Mock auth context
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    userRoles: ['STUDENT'],
    userId: 123
  }))
}));

const mockAllocationData = [
  {
    semester: 'Fall',
    year: 2024,
    course: {
      id: 1,
      name: 'Computer Science 101',
      deptCode: 'COSC',
      courseNum: '101'
    }
  }
];

describe('AllocationHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchStudentAllocationHistoryModule.fetchStudentAllocationHistory).mockResolvedValue(mockAllocationData);
    vi.mocked(fetchUserDetailsModule.fetchUserDetails).mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
  });

  it('renders page title and content', async () => {
    render(
      <BrowserRouter>
        <AllocationHistoryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Teaching Experience')).toBeInTheDocument();
    });
    
    expect(screen.getByText('+ Add Experience')).toBeInTheDocument();
  });
});