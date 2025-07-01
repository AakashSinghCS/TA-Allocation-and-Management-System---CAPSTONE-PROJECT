import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';

// Navbar
vi.mock('../../components/layout/login_navbar/Navbar', () => ({
  default: () => <div data-testid="navbar" />,
}));
// background image
vi.mock('../../assets/ubc_image.png?url', () => ({
  default: 'bg.png',
}));

describe('ForgotPasswordPage', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    vi.resetAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('renders form, inputs and button', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Forgot Your Password\?/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Please enter your email to receive a password reset link/i)
    ).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    expect(emailInput.value).toBe('');
    expect(screen.getByRole('button', { name: /Send Reset Email/i })).toBeInTheDocument();
  });

  it('shows success message on successful fetch', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Email/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/A reset email has been sent\. Please check your inbox\./i)
      ).toBeInTheDocument()
    );
  });

  it('shows form error when response.ok is false', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Server says no'),
    });

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Email/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to send reset email\. Please try again later\./i)
      ).toBeInTheDocument()
    );
  });

  it('shows server error when fetch throws', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network down'));

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Email/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Server error\. Please try again later\./i)
      ).toBeInTheDocument()
    );
  });

  it('clears formError on input change', async () => {
    //  mock a server failure
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Err'),
    });

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    // Use a VALID email so handleForgotPassword runs and sets formError
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Email/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to send reset email\. Please try again later\./i)
      ).toBeInTheDocument()
    );

    // change input again to clear that error
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'new@example.com' },
    });

    expect(
      screen.queryByText(/Failed to send reset email/i)
    ).toBeNull();
  });
});