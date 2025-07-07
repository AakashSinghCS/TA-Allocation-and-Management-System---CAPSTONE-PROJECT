import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManualCreateUserPage from './ManualCreateUserPage';
import { vi, describe, it, beforeEach } from 'vitest';

// Mock useNavigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

declare global {
  interface Window {
    fetch: ReturnType<typeof vi.fn>;
  }
}

describe('ManualCreateUserPage', () => {
  beforeEach(() => {
    window.fetch = vi.fn();
    navigateMock.mockClear();
  });

  it(
    'submits form and navigates back on successful creation',
    async () => {
      (window.fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      render(<ManualCreateUserPage />);

      fireEvent.change(screen.getByLabelText('First Name*'), { target: { value: 'Alice' } });
      fireEvent.change(screen.getByLabelText('Last Name*'), { target: { value: 'Smith' } });
      fireEvent.change(screen.getByLabelText('Email*'), { target: { value: 'alice@example.com' } });
      fireEvent.change(screen.getByLabelText('Role*'), {
        target: { value: 'STUDENT' },
      });
      fireEvent.change(screen.getByLabelText('Password*'), {
        target: { value: 'Password1!' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password*'), {
        target: { value: 'Password1!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => expect(window.fetch).toHaveBeenCalledTimes(1));

      await screen.findByText('User Created!');
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(-1));
    },
    10000
  );

  it(
    'shows error message when email already exists',
    async () => {
      (window.fetch as any).mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('An account with this email already exists'),
      });

      render(<ManualCreateUserPage />);

      fireEvent.change(screen.getByLabelText('First Name*'), { target: { value: 'Bob' } });
      fireEvent.change(screen.getByLabelText('Last Name*'), { target: { value: 'Lee' } });
      fireEvent.change(screen.getByLabelText('Email*'), { target: { value: 'bob@example.com' } });
      fireEvent.change(screen.getByLabelText('Role*'), {
        target: { value: 'INSTRUCTOR' },
      });
      fireEvent.change(screen.getByLabelText('Password*'), {
        target: { value: 'Password1!' },
      });
      fireEvent.change(screen.getByLabelText('Confirm Password*'), {
        target: { value: 'Password1!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(
        await screen.findByText('Email already exists. Please use a different email.')
      ).toBeInTheDocument();

      expect(navigateMock).not.toHaveBeenCalled();
    },
    10000
  );
});
