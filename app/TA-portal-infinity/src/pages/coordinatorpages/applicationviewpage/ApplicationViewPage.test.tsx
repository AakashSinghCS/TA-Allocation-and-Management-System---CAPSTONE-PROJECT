import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationPage from './ApplicationViewPage';
import * as AuthContext from '../../../context/AuthContext';
import * as FetchApplications from '../../../api/application/FetchApplications';
import * as FetchAllocationsByStudent from '../../../api/allocation/fetchAllocationByStudent';
import * as FetchAllocationByIsConfirmed from '../../../api/allocation/fetchAllocationByIsConfirmed';

describe('ApplicationViewPage', () => {
  beforeEach(() => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      token: 'test-token',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
      userRoles: [],
      userId: 1,
    });
  });

  it('renders and filters applications', async () => {
    const mockApp = {
      applicationId: 1,
      preferences: ['COSC 111'],
      wantRemote: true,
      wantWorkingHours: 10,
      timeSubmitted: '2024-01-01T12:00:00Z',
      availabilities: [],
      student: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        studentNum: '12345678',
        program: 'CS',
        enrollmentYear: 2022,
        schoolYear: '2',
      },
    };
    vi.spyOn(FetchApplications, 'fetchApplications').mockResolvedValue([
      mockApp
    ]);
    vi.spyOn(FetchAllocationsByStudent, 'fetchAllocationsByStudent').mockResolvedValue([
      {
        numberOfHours: 5,
        isConfirmed: true,
        section: {
          sectionDetails: {
            deptCode: 'COSC',
            courseNum: '111',
            semester: 'W',
            year: 2024,
            type: 'LECTURE',
          },
          instructor: { firstName: 'Jane', lastName: 'Smith' },
        },
        application: mockApp,
      },
    ]);
    vi.spyOn(FetchAllocationByIsConfirmed, 'fetchAllocationByIsConfirmed').mockResolvedValue([]);

    render(<ApplicationPage />);
    await waitFor(() => expect(screen.getByText('Applications Overview')).toBeInTheDocument());
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('TA Application Stats')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('e.g. John'), { target: { value: 'John' } });
    fireEvent.click(screen.getAllByText('Filter')[0]);
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
  });
});
