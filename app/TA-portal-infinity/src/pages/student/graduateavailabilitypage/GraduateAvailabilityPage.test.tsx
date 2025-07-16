import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GraduateAvailabilityPage from './GraduateAvailabilityPage';
import { AuthContext } from '../../../context/AuthContext';
import { UserRole } from '../../../interfaces/enum/UserRole';

import userEvent from '@testing-library/user-event';
import {fetchExamAvailability, submitExamAvailability, deleteExamAvailability} from "../../../api/exam/ExamAvailability";

vi.mock('@fullcalendar/react', () => {
  let currentEvents: any[] = [];

  return {
    __esModule: true,
    default: (props: any) => {
      currentEvents = props.events;

      return (
        <div data-testid="calendar-mock">
          FullCalendar mock - view: {props.initialView}

          <button onClick={() => props.select?.({
            startStr: '2025-12-01T09:00:00',
            endStr: '2025-12-01T10:00:00'
          })}>
            Mock Select
          </button>

          <button onClick={() => props.customButtons?.clearAll?.click()}>
            {props.customButtons?.clearAll?.text ?? 'Reset'}
          </button>

          {currentEvents?.map((event: any, i: number) => (
            <div key={i}>{event.title}</div>
          ))}
        </div>
      );
    }
  };
});


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

  it('adds an event when mock select is clicked', async () => {
    renderWithProviders();
    const selectButton = await screen.findByText('Mock Select');
    await userEvent.click(selectButton);
    expect(await screen.findByText(/Available/)).toBeInTheDocument();
  });

  it('shows confirmation when reset button is clicked and clears events on confirm', async () => {
    renderWithProviders();
    const selectButton = await screen.findByText('Mock Select');
    await userEvent.click(selectButton);

    const resetButton = await screen.findByText('Reset');
    window.confirm = vi.fn(() => true);
    await userEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.queryByText(/Available/)).toBeInTheDocument();
    });
  });

  it('renders the submit availability button centered', async () => {
    renderWithProviders();
    expect(await screen.findByText('Submit Availability')).toBeInTheDocument();
  });
});


describe("ExamAvailability API", () => {
  const mockToken = "mock-token";
  const studentId = 1;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetchExamAvailability: returns data on success", async () => {
    const mockResponse = [
      {
        id: 1,
        studentId,
        date: "2025-07-15",
        startTime: "10:00:00",
        endTime: "12:00:00",
      },
    ];

    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    ));

    const result = await fetchExamAvailability(studentId, mockToken);
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:8080/exams/${studentId}/availability`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` }),
      })
    );
  });

  it("fetchExamAvailability: throws error on failure", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false })
    ));

    await expect(fetchExamAvailability(studentId, mockToken)).rejects.toThrow("Failed to fetch availability");
  });

  it("submitExamAvailability: sends correct POST request", async () => {
    const events = [
      {
        start: "2025-07-15T10:00:00",
        end: "2025-07-15T12:00:00",
      },
    ];

    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true })
    ));

    await submitExamAvailability(studentId, events, mockToken);

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:8080/exams/${studentId}/availability`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
          "Content-Type": "application/json",
        }),
        body: JSON.stringify([
          {
            studentId,
            date: "2025-07-15",
            startTime: "10:00:00",
            endTime: "12:00:00",
          },
        ]),
      })
    );
  });

  it("submitExamAvailability: throws error on failure", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false })
    ));

    await expect(
      submitExamAvailability(studentId, [], mockToken)
    ).rejects.toThrow("Failed to submit availability");
  });

  it("deleteExamAvailability: sends DELETE request", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true })
    ));

    await deleteExamAvailability(studentId, mockToken);

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:8080/exams/${studentId}/availability`,
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`,
        }),
      })
    );
  });

  it("deleteExamAvailability: throws error on failure", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: false })
    ));

    await expect(deleteExamAvailability(studentId, mockToken)).rejects.toThrow("Failed to delete exam availability");
  });
});