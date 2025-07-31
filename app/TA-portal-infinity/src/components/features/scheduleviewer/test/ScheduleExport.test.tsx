import { render, fireEvent } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import ScheduleExport from '../ScheduleExport';
import { createEvents } from 'ics';

vi.mock('ics', () => ({
  createEvents: vi.fn(( _events, cb) => cb(undefined, 'BEGIN:VCALENDAR\nEND:VCALENDAR')),
}));

describe('ScheduleExport', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob-url');
    URL.revokeObjectURL = vi.fn();
  });

  it('exports CSV on button click', async () => {
    const rows = [
      {
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
      },
    ];
    const { getByText } = render(<ScheduleExport scheduleRows={rows} />);
    await fireEvent.click(getByText(/Export CSV/i));
    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('exports ICS on button click', async () => {
    const rows = [
      {
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
      },
    ];
    const { getByText } = render(<ScheduleExport scheduleRows={rows} />);
    await fireEvent.click(getByText(/Export to Calendar/i));
    await waitFor(() => {
      expect(createEvents).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
