import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ResetPasswordPage from './ResetPasswordPage';

//Navbar
vi.mock('../../../components/layout/login_navbar/Navbar', () => ({
  default: () => <div data-testid="navbar" />,
}));
// bg image
vi.mock('../../../assets/ubc_image.png?url', () => ({
  default: 'bg.png',
}));

describe('ResetPasswordPage', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    vi.resetAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('renders heading, inputs, and button when token is present', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Reset Your Password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    expect(screen.queryByText(/Invalid reset token/i)).toBeNull();
  });

  it('shows an error if no token', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Invalid reset token\./i)).toBeInTheDocument();
  });

  it('validates password mismatch before API call', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'foo' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'bar' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    expect(await screen.findByText(/Passwords do not match\./i)).toBeInTheDocument();
  });

  it('shows success message on successful reset', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Your password has been successfully reset\./i)
      ).toBeInTheDocument()
    );
  });

  it('shows form error when server returns non-OK', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Bad token'),
    });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to reset password\. Please try again\./i)
      ).toBeInTheDocument()
    );
  });

  it('shows server error on fetch throw', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network down'));

    render(
      <MemoryRouter initialEntries={['/reset-password?token=abc']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Server error\. Please try again later\./i)
      ).toBeInTheDocument()
    );
  });
});
