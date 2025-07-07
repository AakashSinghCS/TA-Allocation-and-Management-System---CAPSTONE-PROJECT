vi.mock('../../../api/course/getAllDeptCodes', () => ({
  getAllDeptCodes: vi.fn(() => Promise.resolve(['COSC', 'MATH', 'PHYS'])),
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
  });

  it('renders the heading', async () => {
    renderWithProviders();
    expect(await screen.findByText(/TA Application/i)).toBeInTheDocument();
  });

  // failing required fields validation test as requested

  it('shows details when savedApp is fetched', async () => {
    renderWithProviders();
    expect(await screen.findByRole('button', { name: /view application/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /view application/i }));
    expect(await screen.findByText(/Student ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/Preferences:/i)).toBeInTheDocument();
    expect(screen.getByText(/Remote:/i)).toBeInTheDocument();
    expect(screen.getByText(/Requested Hours:/i)).toBeInTheDocument();
    expect(screen.getByText(/Availability:/i)).toBeInTheDocument();
  });

  it('handles file input, preference select, and application type radio', async () => {
    renderWithProviders();

    await screen.findByLabelText(/1st Preference/i);

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const select = screen.getByLabelText(/1st Preference/i);
    fireEvent.change(select, { target: { value: 'COSC' } });
    expect((select as HTMLSelectElement).value).toBe('COSC');

    const fileInput = screen.getByLabelText(/choose file/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    const radios = screen.getAllByRole('radio', { name: /Application Type/i });

    const gradRadio = radios.find(r => (r as HTMLInputElement).value === 'GRADUATE');
    expect(gradRadio).toBeDefined();
    fireEvent.click(gradRadio!);
    expect((gradRadio as HTMLInputElement).checked).toBe(true);

    await waitFor(() => {
      expect(screen.getByDisplayValue('test.pdf')).toBeInTheDocument();
    });
  });
});
