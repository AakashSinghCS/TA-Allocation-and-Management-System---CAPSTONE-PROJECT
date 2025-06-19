import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApplicationPage from './ApplicationPage';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('ApplicationPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the form title', () => {
    render(<ApplicationPage />, { wrapper: MemoryRouter });
    expect(screen.getByText(/TA Application Submission/i)).toBeInTheDocument();
  });

    it('shows validation errors if form is submitted empty', async () => {
    render(<ApplicationPage />, { wrapper: MemoryRouter });

    const submitBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(screen.getByText(/1st preference is required/i)).toBeInTheDocument();
        expect(screen.getByText(/2nd preference is required/i)).toBeInTheDocument();
        expect(screen.getByText(/3rd preference is required/i)).toBeInTheDocument();
        expect(screen.getByText(/hours requested is required/i)).toBeInTheDocument();
        expect(screen.getByText(/select a remote work preference/i)).toBeInTheDocument();
        expect(screen.getByText(/upload your transcript/i)).toBeInTheDocument();
        expect(screen.getByText(/please confirm profile update/i)).toBeInTheDocument();
    });
    });

  it('updates state on input change', () => {
    render(<ApplicationPage />, { wrapper: MemoryRouter });
    const hoursInput = screen.getByPlaceholderText('Enter hours');
    fireEvent.change(hoursInput, { target: { value: '10' } });
    expect((hoursInput as HTMLInputElement).value).toBe('10');
  });
});
