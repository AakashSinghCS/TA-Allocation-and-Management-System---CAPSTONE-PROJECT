import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import LoginPage from './LoginPage';

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', vi.fn());
  localStorage.clear();
});

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    // Eye icon should not be present when password is empty
    expect(screen.queryByRole('button', { name: /show password|hide password/i })).not.toBeInTheDocument();

    // Enter a password and check for the eye icon
    fireEvent.change(passwordInput, { target: { value: 'testpass123!' } });
    expect(screen.getByRole('button', { name: /show password|hide password/i })).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );
    const passwordInput = screen.getByLabelText(/password/i);
    // Eye icon should not be present initially
    expect(screen.queryByRole('button', { name: /show password|hide password/i })).not.toBeInTheDocument();
    // Enter a password
    fireEvent.change(passwordInput, { target: { value: 'testpass123!' } });
    const toggleButton = screen.getByRole('button', { name: /show password|hide password/i });
    // Default type is password
    expect(passwordInput).toHaveAttribute('type', 'password');
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows error on invalid login', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Unauthorized',
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('logs in and shows success message', async () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      btoa(
        JSON.stringify({
          sub: 'student@example.com',
          userId: 1,
          roles: ['ROLE_STUDENT'],
          iat: 1710000000,
          exp: 1910000000,
        })
      ) +
      '.signature';

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token }),
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'student@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'SecurePass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
  });
});
