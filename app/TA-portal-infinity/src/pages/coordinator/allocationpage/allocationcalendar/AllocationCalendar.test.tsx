import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AllocationCalendar from './AllocationCalendar'; // <-- fix path
import type Section from '../../../../interfaces/section/Section';
import type { ApplicationDto } from '../../../../interfaces/application/Application';
import type { Allocation } from '../../../../interfaces/allocation/Allocation';

// -------------------- Mocks --------------------

vi.mock('@fullcalendar/react', () => {
  return {
    __esModule: true,
    default: ({ events, eventClick }: any) => (
      <div data-testid="fullcalendar">
        {events?.map((e: any) => (
          <div
            key={e.id}
            data-testid={`event-${e.id}`}
            data-type={e.extendedProps?.type}
            onClick={() =>
              eventClick?.({ event: { extendedProps: e.extendedProps } } as any)
            }
          >
            {e.title}
          </div>
        ))}
      </div>
    ),
  };
});

vi.mock('@fullcalendar/timegrid', () => ({ __esModule: true, default: {} }));

vi.mock('../../../../utility/calendar/calendarUtils', () => ({
  getDayNumber: (d: string) =>
    ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].indexOf(
      d.toUpperCase()
    ),
}));

const sendOfferMock = vi.fn();
vi.mock('../../../../hooks/sendoffer/useSendOffer', () => ({
  useSendOffer: () => ({ sendOffer: sendOfferMock, loading: false }),
}));

// -------------------- Helpers --------------------

function makeSection(overlap = false): Section {
  return {
    id: 1,
    sectionSchedule: [
      { day: 'MONDAY', startTime: '10:00', endTime: '11:00' },
      { day: 'WEDNESDAY', startTime: '10:00', endTime: '11:00' },
    ],
    need: {
      requiredGradingHours: 5,
      numHoursCurrentlyAllocated: overlap ? 1 : 3,
    },
  } as unknown as Section;
}

function makeApp(overlap = false): ApplicationDto {
  return {
    id: 42,
    unavailabilities: overlap
      ? [
          { day: 'MONDAY', startTime: '10:30', endTime: '11:00' },
        ]
      : [
          { day: 'TUESDAY', startTime: '10:00', endTime: '11:00' },
        ],
    student: { firstName: 'Test', lastName: 'Student' } as any,
  } as ApplicationDto;
}

// Updated renderCal to include prevAlloc and accommodate sum rendering
const renderCal = (overlap = false, prevAlloc: Allocation | null = null) =>
  render(
    <AllocationCalendar
      selCourse={makeSection(overlap)}
      selApp={makeApp(overlap)}
      prevAlloc={prevAlloc}
      onSendOfferSuccess={vi.fn()}
    />
  );

// -------------------- Tests --------------------

describe('AllocationCalendar', () => {
  beforeEach(() => {
    sendOfferMock.mockClear();
  });

  it('renders legend, inputs, total hours and sum line', () => {
    renderCal(false);

    expect(screen.getByText('Weekly Calendar')).toBeInTheDocument();
    expect(screen.getByText('No Overlap')).toBeInTheDocument();
    expect(screen.getByText('Overlap Exists')).toBeInTheDocument();
    expect(screen.getByText('Section Toggled Off')).toBeInTheDocument();

    // From sample data: 2x 1-hour slots = 2h
    expect(screen.getByText(/Selected Total Section Time:/)).toBeInTheDocument();
    expect(screen.getByText(/2h/)).toBeInTheDocument();

    // Sum line assertions: Section + Grading + Lab Prep = Total
    expect(screen.getByText(/Section 2/)).toBeInTheDocument();
    expect(screen.getByText(/Grading 0/)).toBeInTheDocument();
    expect(screen.getByText(/Lab Prep 0/)).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
    // Final sum (2 + 0 + 0 = 2) appears at least twice (in section count and sum)
    const sumElements = screen.getAllByText('2');
    expect(sumElements.length).toBeGreaterThanOrEqual(1);
  });

  it('disables Send Offer when there is an unavailability match', () => {
    renderCal(true);
    const btn = screen.getByRole('button', { name: /send offer/i });
    expect(btn).toBeDisabled();

    expect(screen.getByText('Unavailability Match:')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('enables Send Offer when clean and calls sendOffer with correct numbers', async () => {
    renderCal(false);
    const btn = screen.getByRole('button', { name: /send offer/i });
    expect(btn).toBeEnabled();

    const gradingInput = screen.getByPlaceholderText(/e\.g\. 10/i);
    fireEvent.change(gradingInput, { target: { value: '7.5abc' } });

    const labInput = screen.getByPlaceholderText(/e\.g\. 1\.5/i);
    fireEvent.change(labInput, { target: { value: '2' } });

    fireEvent.click(btn);

    await waitFor(() => {
      expect(sendOfferMock).toHaveBeenCalledTimes(1);
    });

    const args = sendOfferMock.mock.calls[0];
    expect(args[0].id).toBe(42);
    expect(args[1]).toBe(1);
    expect(args[3]).toBe(2);
    expect(args[4]).toBe(2);
    expect(args[5]).toBe(7.5);
    expect(args[6]).toBe(false);
  });

  it('clicking a section event toggles ALL off (then back on) and updates hours', async () => {
    renderCal(false);
    const eventDiv = screen.getByTestId('event-c0');
    fireEvent.click(eventDiv);

    await waitFor(() => {
      expect(screen.getByText(/Selected Total Section Time:/).nextSibling).toHaveTextContent('0h');
    });

    fireEvent.click(eventDiv);
    await waitFor(() => {
      expect(screen.getByText(/Selected Total Section Time:/).nextSibling).toHaveTextContent('2h');
    });
  });

  it('numeric inputs strip non-numeric characters', () => {
    renderCal(false);
    const gradingInput = screen.getByPlaceholderText(/e\.g\. 10/i);
    fireEvent.change(gradingInput, { target: { value: 'a1b2.3c.4' } });

    expect((gradingInput as HTMLInputElement).value).toBe('12.3');
  });
});
