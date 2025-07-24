import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AllocationCalendar from './AllocationCalendar'; // <-- fix path
import type Section from '../../../../interfaces/section/Section';
import type { ApplicationDto } from '../../../../interfaces/application/Application';

// -------------------- Mocks --------------------

// FullCalendar is heavy in JSDOM. Stub it so we can still click "events".
vi.mock('@fullcalendar/react', () => {
  const React = require('react');
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

// timeGridPlugin just needs to exist
vi.mock('@fullcalendar/timegrid', () => ({ __esModule: true, default: {} }));

// getDayNumber util — keep actual or stub. Here we keep simple mapping.
vi.mock('../../../../utility/calendar/calendarUtils', () => ({
  getDayNumber: (d: string) =>
    ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].indexOf(
      d.toUpperCase()
    ),
}));

// Hook that sends the offer
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
    // other fields you don't use in this component can be stubbed or omitted
  } as unknown as Section;
}

function makeApp(overlap = false): ApplicationDto {
  return {
    id: 42,
    availabilities: overlap
      ? [
          // overlaps Monday 10-11
          { day: 'MONDAY', startTime: '10:30', endTime: '11:00' },
        ]
      : [
          // no overlap: Tuesday 10-11
          { day: 'TUESDAY', startTime: '10:00', endTime: '11:00' },
        ],
    student: { firstName: 'Test', lastName: 'Student' } as any,
  } as ApplicationDto;
}

const renderCal = (overlap = false) =>
  render(
    <AllocationCalendar
      selCourse={makeSection(overlap)}
      selApp={makeApp(overlap)}
      onSendOfferSuccess={vi.fn()}
    />
  );

// -------------------- Tests --------------------

describe('AllocationCalendar', () => {
  beforeEach(() => {
    sendOfferMock.mockClear();
  });

  it('renders legend, inputs and total hours', () => {
    renderCal(false);

    expect(screen.getByText('Weekly Calendar')).toBeInTheDocument();
    expect(screen.getByText('No Overlap')).toBeInTheDocument();
    expect(screen.getByText('Overlap Exists')).toBeInTheDocument();
    expect(screen.getByText('Section Toggled Off')).toBeInTheDocument();

    // From our sample data: 2x 1-hour slots = 2h
    expect(screen.getByText(/Selected Total Section Time:/)).toBeInTheDocument();
    expect(screen.getByText(/2h/)).toBeInTheDocument();
  });

  it('disables Send Offer when there is an unavailability match', () => {
    renderCal(true); // overlap = true
    const btn = screen.getByRole('button', { name: /send offer/i });
    expect(btn).toBeDisabled();

    expect(screen.getByText('Unavailability Match:')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('enables Send Offer when clean and calls sendOffer with correct numbers', async () => {
    renderCal(false);
    const btn = screen.getByRole('button', { name: /send offer/i });
    expect(btn).toBeEnabled();

    // Fill grading and lab prep inputs (they are text)
    const grading = screen.getByPlaceholderText(/e\.g\. 10/i);
    fireEvent.change(grading, { target: { value: '7.5abc' } }); // should clean to 7.5

    const lab = screen.getByPlaceholderText(/e\.g\. 1\.5/i);
    fireEvent.change(lab, { target: { value: '2' } });

    // click send
    fireEvent.click(btn);

    await waitFor(() => {
      expect(sendOfferMock).toHaveBeenCalledTimes(1);
    });

    // Args: (selApp, selCourse.id, selCourse.need, sectionHrs, labPrepHours, gradingHours, hasUnavailabilityMatch, cb)
    const args = sendOfferMock.mock.calls[0];
    expect(args[0].id).toBe(42); // app
    expect(args[1]).toBe(1); // course id
    expect(args[3]).toBe(2); // section hours
    expect(args[4]).toBe(2); // labPrep
    expect(args[5]).toBe(7.5); // grading
    expect(args[6]).toBe(false); // hasUnavailabilityMatch
  });

  it('clicking a section event toggles ALL off (then back on) and updates hours', async () => {
    renderCal(false);

    // Events are stubbed as divs; one of the section events will have id 'c0'
    const eventDiv = screen.getByTestId('event-c0');
    // First click => turn ALL off
    fireEvent.click(eventDiv);

    await waitFor(() => {
      expect(screen.getByText(/Selected Total Section Time:/).nextSibling).toHaveTextContent('0h');
    });

    // Second click => turn ALL back on
    fireEvent.click(eventDiv);
    await waitFor(() => {
      expect(screen.getByText(/Selected Total Section Time:/).nextSibling).toHaveTextContent('2h');
    });
  });

  it('numeric inputs strip non-numeric characters', () => {
    renderCal(false);
    const grading = screen.getByPlaceholderText(/e\.g\. 10/i);
    fireEvent.change(grading, { target: { value: 'a1b2.3c.4' } });

    // Only first dot kept -> "12.3"
    expect((grading as HTMLInputElement).value).toBe('12.3');
  });
});
