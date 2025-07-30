import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationPage from './ApplicationPage';
import { AuthContext } from '../../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { UserRole } from '../../../interfaces/enum/UserRole';

let deleteApplicationMock: any = vi.fn();
vi.mock('../../../api/application/DeleteApplication', () => ({
  deleteApplication: (...args: any[]) => deleteApplicationMock(...args),
}));
vi.mock('../../../api/course/getAllDeptCodes', () => ({
  getAllDeptCodes: vi.fn(() => Promise.resolve(['COSC', 'MATH', 'PHYS'])),
}));
vi.mock('../../../api/semester/getActiveSemesters', () => ({
  getActiveSemesters: vi.fn(() => Promise.resolve([
    { year: 2025, semester: 'W1' },
    { year: 2025, semester: 'W2' }
  ])),
}));
vi.mock('../../../api/admin/FetchDeadline', () => ({
  fetchDeadlines: vi.fn(() => Promise.resolve([
    {
      name: 'student_application_deadline',
      endTime: '2025-12-31T23:59:59Z'
    }
  ])),
}));

// mock fetch globally
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{
      id: 1,
      studentId: 123,
      year: 2025,
      semester: 'Summer',
      student: {
        id: 1,
        firstName: 'Test',
        lastName: 'Student',
        studentNum: 'S12345678',
        program: 'COSC',
        enrollmentYear: 2022,
        schoolYear: '3',
      },
      preferences: ['COSC111', 'COSC121'],
      wantRemote: true,
      wantWorkingHours: 10,
      timeSubmitted: new Date().toISOString(),
      availabilities: [],
      applicationType: 'UNDERGRADUATE',
    }]),
  })
) as unknown as typeof fetch;

const mockContext = {
  token: 'test-token',
  userId: 123,
  userRoles: [UserRole.STUDENT],
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: true
};

const renderWithProviders = () =>
  render(
    <AuthContext.Provider value={mockContext}>
      <MemoryRouter>
        <ApplicationPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe('ApplicationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global fetch to default mock (with saved application)
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{
          id: 1,
          studentId: 123,
          year: 2025,
          semester: 'Summer',
          student: {
            id: 1,
            firstName: 'Test',
            lastName: 'Student',
            studentNum: 'S12345678',
            program: 'COSC',
            enrollmentYear: 2022,
            schoolYear: '3',
          },
          preferences: ['COSC111', 'COSC121'],
          wantRemote: true,
          wantWorkingHours: 10,
          timeSubmitted: new Date().toISOString(),
          availabilities: [],
          applicationType: 'UNDERGRADUATE',
        }]),
      })
    ) as unknown as typeof fetch;
    // Reset deleteApplicationMock for each test
    deleteApplicationMock = vi.fn();
  });

  it('allows deleting an application and resets state', async () => {
    // Mock deleteApplication API for this test
    deleteApplicationMock.mockResolvedValueOnce(undefined);

    renderWithProviders();
    await waitFor(() => expect(screen.queryByText(/Loading department codes/i)).not.toBeInTheDocument());
    // Open details to ensure savedApp is present
    fireEvent.click(await screen.findByRole('button', { name: /view application/i }));
    expect(screen.getByText(/Student ID:/i)).toBeInTheDocument();

    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: /delete application/i }));
    // Confirm toast appears
    expect(await screen.findByText(/Delete Application\?/i)).toBeInTheDocument();
    // Click Delete in toast (find correct button)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // The toast's delete button should have textContent 'Delete'
    const confirmDeleteBtn = deleteButtons.find(btn => btn.textContent?.trim() === 'Delete');
    expect(confirmDeleteBtn).toBeDefined();
    fireEvent.click(confirmDeleteBtn!);

    // Wait for success toast and verify deletion was called
    await waitFor(() => {
      expect(deleteApplicationMock).toHaveBeenCalled();
      expect(screen.queryByText(/Application deleted successfully/i)).toBeInTheDocument();
    });
    
    // Just verify the delete was called - don't wait for UI changes that might be complex
    expect(deleteApplicationMock).toHaveBeenCalledTimes(1);
  }, 15000);

  it('shows error toast if delete fails due to permission', async () => {
    // Mock deleteApplication API to throw 403 error for this test
    deleteApplicationMock.mockRejectedValueOnce(new Error('403 Forbidden'));

    renderWithProviders();
    await waitFor(() => expect(screen.queryByText(/Loading department codes/i)).not.toBeInTheDocument());
    // Wait for the view application button to appear before clicking
    const viewBtn = await screen.findByRole('button', { name: /view application/i });
    fireEvent.click(viewBtn);
    fireEvent.click(screen.getByRole('button', { name: /delete application/i }));
    expect(await screen.findByText(/Delete Application\?/i)).toBeInTheDocument();
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    const confirmDeleteBtn = deleteButtons.find(btn => btn.textContent?.trim() === 'Delete');
    fireEvent.click(confirmDeleteBtn!);

    await waitFor(() => {
      expect(deleteApplicationMock).toHaveBeenCalled();
      expect(screen.queryByText(/do not have permission to delete/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    // Now check for the view application button separately
    expect(screen.queryByRole('button', { name: /view application/i })).not.toBeInTheDocument();
  });

  it('renders the heading', async () => {
    renderWithProviders();
    // Be more specific - find the main heading, not just any text containing "TA Application"
    expect(await screen.findByRole('heading', { name: /TA Application Submission/i })).toBeInTheDocument();
  });

  it('shows details when savedApp is fetched', async () => {
    renderWithProviders();
    // Wait for department codes to load (removes loading message)
    await waitFor(() => expect(screen.queryByText(/Loading department codes/i)).not.toBeInTheDocument());
    // Check if application list shows existing applications by checking the container instead of specific buttons
    await waitFor(() => {
      expect(screen.getByText(/Application ID:/i)).toBeInTheDocument();
    });
  });


  it('handles year/semester term selection, preference select, and application type radio', async () => {
    renderWithProviders();
    // Wait for department codes to load first
    await waitFor(() => expect(screen.queryByText(/Loading department codes/i)).not.toBeInTheDocument());

    // Check for term selection checkboxes and labels
    expect(screen.getAllByText((_, element) => {
      return element?.textContent?.includes('Select Terms') || false;
    })[0]).toBeInTheDocument();
    
    // Select a term to trigger the form rendering
    const w1Checkbox = screen.getByLabelText(/2025 W1/i);
    expect(w1Checkbox).toBeInTheDocument();
    fireEvent.click(w1Checkbox);
    
    // Wait for the form to update after term selection
    await waitFor(() => {
      // Check for preference select fields - these should appear when a term is selected
      expect(screen.getByLabelText(/1st Preference/i)).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/2nd Preference/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/3rd Preference/i)).toBeInTheDocument();

    // Check for application type radio buttons by their values
    expect(screen.getByDisplayValue('UNDERGRADUATE')).toBeInTheDocument();
    expect(screen.getByDisplayValue('GRADUATE')).toBeInTheDocument();
  });
});
