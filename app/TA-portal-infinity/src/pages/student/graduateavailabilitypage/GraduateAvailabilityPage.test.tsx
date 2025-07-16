import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GraduateAvailabilityPage from './GraduateAvailabilityPage';
import { AuthContext } from '../../../context/AuthContext';
import { UserRole } from '../../../interfaces/enum/UserRole';

vi.mock('@fullcalendar/react', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="calendar-mock">
      FullCalendar mock - view: {props.initialView}
      <button onClick={() => props.select?.({ startStr: '2025-12-01T09:00:00', endStr: '2025-12-01T10:00:00' })}>
        Mock Select
      </button>
    </div>
  )
}));

vi.mock('../../../api/application/FetchApplicationsByStudent', () => ({
  fetchApplicationsByStudent: vi.fn(() =>
    Promise.resolve([
      {
        timeSubmitted: new Date().toISOString(),
        applicationType: 'GRADUATE',
        student: { id: 1, firstName: 'Test', lastName: 'User', studentNum: 'S123', program: null, enrollmentYear: null, schoolYear: null },
        preferences: [],
        wantRemote: true,
        wantWorkingHours: 8,
        availabilities: [],
      }
    ])
  )
}));

const mockContext = {
  token: 'test-token',
  userId: 1,
  userRoles: [UserRole.STUDENT],
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true
};

const renderWithProviders = () =>
  render(
    <AuthContext.Provider value={mockContext}>
      <MemoryRouter>
        <GraduateAvailabilityPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('GraduateAvailabilityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the calendar when the student is a graduate', async () => {
    renderWithProviders();
    expect(await screen.findByText(/Final Exam Availability/i)).toBeInTheDocument();
    expect(await screen.findByTestId('calendar-mock')).toBeInTheDocument();
  });

  it('shows the fallback message if no graduate application found', async () => {
    const { fetchApplicationsByStudent } = await import('../../../api/application/FetchApplicationsByStudent');
    (fetchApplicationsByStudent as any).mockResolvedValueOnce([
      {
        timeSubmitted: new Date().toISOString(),
        applicationType: 'UNDERGRADUATE',
        student: {},
        preferences: [],
        wantRemote: true,
        wantWorkingHours: 8,
        availabilities: [],
      }
    ]);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/Only graduate students with a current year application can access this page./i)).toBeInTheDocument();
    });
  });
});
