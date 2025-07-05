import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApplicationPage from './ApplicationPage';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { UserRole } from '../../interfaces/enum/UserRole';

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
  });

  it('renders the heading', async () => {
    renderWithProviders();
    expect(await screen.findByText(/TA Application/i)).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    renderWithProviders();
    // The button could be 'Submit Application' or 'Update Application'
    let submitBtn = screen.queryByRole('button', { name: /submit application/i });
    if (!submitBtn) {
      submitBtn = screen.getByRole('button', { name: /update application/i });
    }
    fireEvent.click(submitBtn!);
    expect(await screen.findByText(/1st preference is required/)).toBeInTheDocument();
    expect(screen.getByText(/Upload your transcript/)).toBeInTheDocument();
  });

  it('shows modal when savedApp is fetched', async () => {
    renderWithProviders();
    expect(await screen.findByRole('button', { name: /view details/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /view details/i }));
    expect(await screen.findByText(/Previous Application Details/)).toBeInTheDocument();
  });

  it('handles file input, preference select, and application type radio', async () => {
    renderWithProviders();

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    // Find the first select (combobox) for preferences
    const select = screen.getByLabelText(/1st Preference/i);
    fireEvent.change(select, { target: { value: 'COSC' } });
    expect((select as HTMLSelectElement).value).toBe('COSC');

    // File input
    const fileInput = screen.getByLabelText(/choose file/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Application type radio (get all and pick the one for graduate)
    const gradRadios = screen.getAllByRole('radio', { name: /graduate/i });
    const gradRadio = gradRadios[0];
    fireEvent.click(gradRadio);
    expect((gradRadio as HTMLInputElement).checked).toBe(true);

    await waitFor(() => {
      expect(screen.getByDisplayValue('test.pdf')).toBeInTheDocument();
    });
  });
});
