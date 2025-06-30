import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SignUpPage from './SignUpPage';

// Mock useNavigate while preserving other react-router-dom exports
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

declare global {
  interface Window {
    fetch: ReturnType<typeof vi.fn>;
  }
}

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('SignUpPage', () => {
  beforeEach(() => {
    window.fetch = vi.fn();
    navigateMock.mockClear();
  });

  it('renders form fields correctly', () => {
    renderWithRouter(<SignUpPage />);
    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role\*/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Password\*/i)).toHaveLength(2);
    const submitBtn = screen.getAllByRole('button').find(btn => btn.getAttribute('type') === 'submit');
    expect(submitBtn).toHaveTextContent(/sign up/i);
  });

  it('shows password mismatch error', async () => {
    renderWithRouter(<SignUpPage />);

    // fill required fields
    const fill = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fill(/First Name\*/i, 'A');
    fill(/Last Name\*/i, 'B');
    fill(/Email\*/i, 'a@b.com');
    fill(/Role\*/i, 'STUDENT');

    const [pwd, confirm] = screen.getAllByLabelText(/Password\*/i);
    fireEvent.change(pwd, { target: { value: 'abc123!A' } });
    fireEvent.change(confirm, { target: { value: 'different' } });

    const submitBtn = screen.getAllByRole('button').find(
      btn => btn.getAttribute('type') === 'submit'
    );
    fireEvent.click(submitBtn!);

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

it('submits valid form and shows success message', async () => {
    (window.fetch as any).mockResolvedValue({ ok: true });

    renderWithRouter(<SignUpPage />);

    const fill = (label: RegExp, value: string) =>
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fill(/First Name\*/i, 'X');
    fill(/Last Name\*/i, 'Y');
    fill(/Email\*/i, 'x@y.com');
    fill(/Role\*/i, 'INSTRUCTOR');

    const [pwd, confirm] = screen.getAllByLabelText(/Password\*/i);
    fireEvent.change(pwd, { target: { value: 'ValidPass1!' } });
    fireEvent.change(confirm, { target: { value: 'ValidPass1!' } });

    const submitBtn = screen
      .getAllByRole('button')
      .find(btn => btn.getAttribute('type') === 'submit');
    fireEvent.click(submitBtn!);

    await waitFor(() => expect(window.fetch).toHaveBeenCalledTimes(1));

    expect(
      await screen.findByText(/Signup successful! Redirecting to login…/i)
    ).toBeInTheDocument();
  });
});