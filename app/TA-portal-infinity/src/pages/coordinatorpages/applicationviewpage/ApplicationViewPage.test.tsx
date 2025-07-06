import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as FetchAllocationByStatus from '../../../api/allocation/fetchAllocationByStatus';
import * as FetchAllocationsByStudent from '../../../api/allocation/fetchAllocationByStudent';
import * as FetchApplications from '../../../api/application/FetchApplications';
import * as AuthContext from '../../../context/AuthContext';
import ApplicationPage from './ApplicationViewPage';

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
        status: 'CONFIRMED',
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
    vi.spyOn(FetchAllocationByStatus, 'fetchAllocationByStatus').mockResolvedValue([]);

    render(<ApplicationPage />);
    await waitFor(() => expect(screen.getByText('Applications Overview')).toBeInTheDocument());
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('TA Application Stats')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('e.g. John'), { target: { value: 'John' } });
    fireEvent.click(screen.getAllByText('Filter')[0]);
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
  });
});
