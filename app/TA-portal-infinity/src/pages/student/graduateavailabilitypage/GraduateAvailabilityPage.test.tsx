// GraduateAvailabilityPage.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import GraduateAvailabilityPage from './GraduateAvailabilityPage';
import { MemoryRouter } from 'react-router-dom';
import { vi, beforeEach, describe, it, expect, type Mock } from 'vitest';

// 1️⃣ Mock useAuth from AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
import { useAuth } from '../../../context/AuthContext';

// 2️⃣ Mock applications API
vi.mock('../../../api/application/FetchApplicationsByStudent', () => ({
  fetchApplicationsByStudent: vi.fn(),
}));
import { fetchApplicationsByStudent } from '../../../api/application/FetchApplicationsByStudent';

// 3️⃣ Mock exam availability API
vi.mock('../../../api/exam/ExamAvailability', () => ({
  fetchExamAvailability: vi.fn(),
  submitExamAvailability: vi.fn(),
  deleteExamAvailability: vi.fn(),
}));
import { fetchExamAvailability } from '../../../api/exam/ExamAvailability';

// 4️⃣ Stub FullCalendar to a simple div
vi.mock('@fullcalendar/react', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="calendar-mock">Events: {props.events.length}</div>
  ),
}));

describe('GraduateAvailabilityPage (with useAuth mock)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders calendar when student is graduate', async () => {
    // Arrange: make useAuth return a logged‑in student
    (useAuth as Mock).mockReturnValue({
      token: 'tok',
      userId: 42,
      userRoles: ['STUDENT'],
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    // Arrange: applications API returns a GRADUATE app this year
    (fetchApplicationsByStudent as Mock).mockResolvedValue([
      { timeSubmitted: new Date().toISOString(), applicationType: 'GRADUATE' },
    ]);

    // Arrange: exam availability API returns one slot
    (fetchExamAvailability as Mock).mockResolvedValue([
      { date: '2025-07-15', startTime: '10:00:00', endTime: '12:00:00' },
    ]);

    // Act
    render(
      <MemoryRouter>
        <GraduateAvailabilityPage />
      </MemoryRouter>
    );

    // Assert loading state
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();

    // Wait for graduate UI
    expect(
      await screen.findByText(/Final Exam Availability/i)
    ).toBeInTheDocument();

    // Our stubbed calendar should report 1 event
    expect(screen.getByTestId('calendar-mock')).toHaveTextContent('Events: 1');

    // Submit button is present
    expect(screen.getByRole('button', { name: /Submit Availability/i }))
      .toBeInTheDocument();
  });

  it('renders fallback when not a graduate', async () => {
    // Arrange: same auth mock
    (useAuth as Mock).mockReturnValue({
      token: 'tok',
      userId: 42,
      userRoles: ['STUDENT'],
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    // Arrange: applications API returns an UNDERGRAD
    (fetchApplicationsByStudent as Mock).mockResolvedValue([
      { timeSubmitted: new Date().toISOString(), applicationType: 'UNDERGRADUATE' },
    ]);

    render(
      <MemoryRouter>
        <GraduateAvailabilityPage />
      </MemoryRouter>
    );

    // Wait for the fallback message
    await waitFor(() =>
      expect(
        screen.getByText(
          /Only graduate students with a current year application can access this page/i
        )
      ).toBeInTheDocument()
    );
  });
});
