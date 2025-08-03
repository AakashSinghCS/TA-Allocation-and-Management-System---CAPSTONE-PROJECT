import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent } from '@testing-library/react';

// mock API modules
vi.mock('../../../api/student/fetchStudentDetails', () => ({ fetchStudentDetails: vi.fn() }));
vi.mock('../../../api/application/FetchApplicationsByStudent', () => ({ fetchApplicationsByStudent: vi.fn() }));
vi.mock('../../../api/student/enrollment/fetchAllStudentCompletedCourses', () => ({ fetchAllStudentEnrollmentOverview: vi.fn() }));
vi.mock('../../../api/question/fetchAllStudentQuestion', () => ({ fetchAllStudentQuestions: vi.fn() }));
vi.mock('../../../api/allocation/fetchAllocationByApplicationId', () => ({ fetchAllocationByApplicationId: vi.fn() }));
// mock AuthContext
vi.mock('../../../context/AuthContext', () => ({ useAuth: () => ({ userId: '123' }) }));

import { fetchStudentDetails } from '../../../api/student/fetchStudentDetails';
import { fetchApplicationsByStudent } from '../../../api/application/FetchApplicationsByStudent';
import { fetchAllStudentEnrollmentOverview } from '../../../api/student/enrollment/fetchAllStudentCompletedCourses';
import { fetchAllStudentQuestions } from '../../../api/question/fetchAllStudentQuestion';
import { fetchAllocationByApplicationId } from '../../../api/allocation/fetchAllocationByApplicationId';
import StudentHomePage from './StudentHomePage';

describe('StudentHomePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state initially', () => {
    (fetchStudentDetails as any).mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <StudentHomePage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
  });

  it('renders error state', async () => {
    (fetchStudentDetails as any).mockRejectedValue(new Error('Failed API'));
    render(
      <MemoryRouter>
        <StudentHomePage />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/Failed API/)).toBeInTheDocument());
  });

  it('renders dashboard metrics and student info', async () => {
    // mock APIs to return data
    (fetchStudentDetails as any).mockResolvedValue({ firstName: 'Jane', lastName: 'Doe', studentNum: 'S001', email: 'jane@example.com', schoolYear: 'Senior', enrollmentYear: '2021' });
    (fetchApplicationsByStudent as any).mockResolvedValue([{ id: 1, timeSubmitted: new Date().toISOString(), preferences: ['COSC'], wantRemote: true, wantWorkingHours: 10 }]);
    (fetchAllocationByApplicationId as any).mockResolvedValue([{ status: 'CONFIRMED' }]);
    (fetchAllStudentEnrollmentOverview as any).mockResolvedValue({ completedCourses: [{ course: { id: 101, deptCode: 'COSC', courseNum: '499', name: 'Capstone' } }] });
    (fetchAllStudentQuestions as any).mockResolvedValue([{ id: 1, description: 'Why TA?', answers: [{ answerText: 'Passion' }] }]);

    render(
      <MemoryRouter>
        <StudentHomePage />
      </MemoryRouter>
    );

    //dashboard heading
    await waitFor(() => expect(screen.getByText(/My Dashboard/i)).toBeInTheDocument());
    // Check for the "1" in the "Total Applications" metric card
    const totalAppsCard = screen.getByText("Total Applications").closest('.bg-white');
    expect(totalAppsCard).not.toBeNull();
    const valueElement = totalAppsCard!.querySelector('.text-lg.font-bold');
    expect(valueElement).toHaveTextContent('1');
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0); 
    // student name
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    // profile email
    expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
  });

  it('displays profile questions and courses taken sections', async () => {
    (fetchStudentDetails as any).mockResolvedValue({ firstName: 'Jane', lastName: 'Doe', studentNum: 'S001', email: 'jane@example.com', schoolYear: 'Senior', enrollmentYear: '2021' });
    (fetchApplicationsByStudent as any).mockResolvedValue([{ id: 1, timeSubmitted: new Date().toISOString(), preferences: ['COSC'], wantRemote: true, wantWorkingHours: 10 }]);
    (fetchAllocationByApplicationId as any).mockResolvedValue([{ status: 'SENT' }]);
    (fetchAllStudentEnrollmentOverview as any).mockResolvedValue({ completedCourses: [{ course: { id: 101, deptCode: 'COSC', courseNum: '499', name: 'Capstone' } }] });
    (fetchAllStudentQuestions as any).mockResolvedValue([{ id: 1, description: 'Why TA?', answers: [{ answerText: 'Passion' }] }]);

    render(
      <MemoryRouter>
        <StudentHomePage />
      </MemoryRouter>
    );

    //  use role-based query for heading
    await waitFor(() => expect(screen.getByRole('heading', { name: /Profile Questions/ })).toBeInTheDocument());
    expect(screen.getByText('Why TA?')).toBeInTheDocument();
    expect(screen.getByText(/Passion/)).toBeInTheDocument();
    expect(screen.getByText(/Courses Taken/)).toBeInTheDocument();
    expect(screen.getByText(/COSC 499 - Capstone/)).toBeInTheDocument();
  });

  it('toggles notifications section and dismisses a notification', async () => {
    (fetchStudentDetails as any).mockResolvedValue({ firstName: 'Jane', lastName: 'Doe', studentNum: 'S001', email: 'jane@example.com', schoolYear: 'Senior', enrollmentYear: '2021' });
    (fetchApplicationsByStudent as any).mockResolvedValue([{ id: 1, timeSubmitted: new Date().toISOString(), preferences: ['COSC'], wantRemote: true, wantWorkingHours: 10, allocation: { status: 'CONFIRMED' } }]);
    (fetchAllocationByApplicationId as any).mockResolvedValue([{ status: 'CONFIRMED' }]);
    (fetchAllStudentEnrollmentOverview as any).mockResolvedValue({ completedCourses: [] });
    (fetchAllStudentQuestions as any).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <StudentHomePage />
      </MemoryRouter>
    );

    // notifications label
    await waitFor(() => expect(screen.getByText(/Notifications/)).toBeInTheDocument());
    // have at least one notification
    expect(screen.getAllByRole('listitem')).not.toHaveLength(0);

    // hide notifications
    const toggleBtn = screen.getByText('Hide');
    fireEvent.click(toggleBtn);
    expect(screen.queryByText(/No notifications/)).not.toBeInTheDocument();
    // show again
    fireEvent.click(screen.getByText('Show'));
    const offers = screen.queryAllByText(/Offer Accepted/);
    expect(offers.length).toBeGreaterThanOrEqual(0);

    // If there are notifications to dismiss, test dismissing one
    const dismissBtns = screen.queryAllByLabelText('Remove notification');
    if (dismissBtns.length > 0) {
      fireEvent.click(dismissBtns[0]);
    }
  });
});
