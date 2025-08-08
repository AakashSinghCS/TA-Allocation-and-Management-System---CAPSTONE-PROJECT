import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScheduleViewerTable from '../ScheduleViewerTable';
import type { ScheduleRow } from '../ScheduleViewer.types';
import { AuthContext } from '../../../../context/AuthContext';

// Mock the getSemesterDates API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { year: 2025, semester: 'W1', startDate: '2025-01-05', endDate: '2025-04-09' },
      { year: 2025, semester: 'W2', startDate: '2025-09-02', endDate: '2025-12-05' },
    ]),
  })
) as unknown as typeof fetch;

const mockAuthContext = {
  token: 'test-token',
  userId: 123,
  userRoles: [],
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true
};

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('ScheduleViewerTable', () => {
  const startOfWeek = new Date('2025-01-05');
  const baseRow: ScheduleRow = {
    id: 1,
    course: 'CSC 101',
    section: '001',
    instructor: 'Jane Doe',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    status: 'CONFIRMED',
    semester: 'W1',
    year: 2025,
    numberOfHours: 1,
  };

  it('renders table headers and data correctly', async () => {
    renderWithAuth(<ScheduleViewerTable scheduleRows={[baseRow]} startOfWeek={startOfWeek} />);
    
    // Headers
    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByText('Section')).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Semester')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Instructor')).toBeInTheDocument();

    // Data row
    expect(screen.getByText('CSC 101')).toBeInTheDocument();
    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('2025 W1')).toBeInTheDocument();
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    
    // Wait for semester ranges to load and check they appear
    await screen.findByText('2025-01-05');
    expect(screen.getByText('2025-04-09')).toBeInTheDocument();
  });

  it('shows No schedule when day or time is missing', () => {
    const incompleteRow = { ...baseRow, day: '', startTime: '', endTime: '' };
    renderWithAuth(<ScheduleViewerTable scheduleRows={[incompleteRow]} startOfWeek={startOfWeek} />);
    expect(screen.getByText('No schedule')).toBeInTheDocument();
  });
});
