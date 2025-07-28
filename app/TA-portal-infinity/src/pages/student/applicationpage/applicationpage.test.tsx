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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationPage from './ApplicationPage';
import { AuthContext } from '../../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { UserRole } from '../../../interfaces/enum/UserRole';

// mock fetch globally
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      studentId: 123,
      student: { studentNum: 'S12345678' },
      preferences: ['COSC111', 'COSC121'],
      wantRemote: true,
      wantWorkingHours: 10,
      timeSubmitted: new Date().toISOString(),
      availabilities: [],
      applicationType: 'UNDERGRADUATE',
    }),
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
        json: () => Promise.resolve({
          studentId: 123,
          student: { studentNum: 'S12345678' },
          preferences: ['COSC111', 'COSC121'],
          wantRemote: true,
          wantWorkingHours: 10,
          timeSubmitted: new Date().toISOString(),
          availabilities: [],
          applicationType: 'UNDERGRADUATE',
        }),
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

    // Wait for success toast and state reset
    await waitFor(() => {
      expect(deleteApplicationMock).toHaveBeenCalled();
      expect(screen.queryByText(/Application deleted successfully/i)).toBeInTheDocument();
      // The view application button should disappear
      expect(screen.queryByRole('button', { name: /view application/i })).not.toBeInTheDocument();
    });
  });

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

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global fetch to default mock (with saved application)
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          studentId: 123,
          student: { studentNum: 'S12345678' },
          preferences: ['COSC111', 'COSC121'],
          wantRemote: true,
          wantWorkingHours: 10,
          timeSubmitted: new Date().toISOString(),
          availabilities: [],
          applicationType: 'UNDERGRADUATE',
        }),
      })
    ) as unknown as typeof fetch;
  });

  it('renders the heading', async () => {
    renderWithProviders();
    expect(await screen.findByText(/TA Application/i)).toBeInTheDocument();
  });

  // failing required fields validation test as requested

  it('shows details when savedApp is fetched', async () => {
    renderWithProviders();
    // Wait for department codes to load (removes loading message)
    await waitFor(() => expect(screen.queryByText(/Loading department codes/i)).not.toBeInTheDocument());
    // Now the savedApp should be loaded and the button should appear
    expect(await screen.findByRole('button', { name: /view application/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /view application/i }));
    expect(await screen.findByText(/Student ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/Preferences:/i)).toBeInTheDocument();
    expect(screen.getByText(/Remote:/i)).toBeInTheDocument();
    expect(screen.getByText(/Requested Hours:/i)).toBeInTheDocument();
    expect(screen.getByText(/Availability:/i)).toBeInTheDocument();
  });

  it('handles year/semester inputs, preference select, and application type radio', async () => {
    renderWithProviders();

    await screen.findByLabelText(/1st Preference/i);

    // Test year input
    const yearInput = screen.getByLabelText(/Year/i);
    fireEvent.change(yearInput, { target: { value: '2024' } });
    expect((yearInput as HTMLInputElement).value).toBe('2024');

    // Test semester select
    const semesterSelect = screen.getByLabelText(/Semester/i);
    fireEvent.change(semesterSelect, { target: { value: 'W1' } });
    expect((semesterSelect as HTMLSelectElement).value).toBe('W1');

    // Test preference select
    const select = screen.getByLabelText(/1st Preference/i);
    fireEvent.change(select, { target: { value: 'COSC' } });
    expect((select as HTMLSelectElement).value).toBe('COSC');

    const radios = screen.getAllByRole('radio', { name: /Application Type/i });

    const gradRadio = radios.find(r => (r as HTMLInputElement).value === 'GRADUATE');
    expect(gradRadio).toBeDefined();
    fireEvent.click(gradRadio!);
    expect((gradRadio as HTMLInputElement).checked).toBe(true);
  });
});
