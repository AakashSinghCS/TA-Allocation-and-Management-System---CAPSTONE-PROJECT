import { render, screen, fireEvent } from '@testing-library/react';
import CreateUserForm, { type UserFormData } from './CreateUserForm';
import { describe, it, expect, vi } from 'vitest';

describe('CreateUserForm', () => {
  it('displays password mismatch error and does not call onSubmit', async () => {
    const mockOnSubmit = vi.fn();
    render(<CreateUserForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/First Name\*/i),       { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Last Name\*/i),        { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/Email\*/i),            { target: { value: 'test@domain.com' } });
    fireEvent.change(screen.getByLabelText(/Role\*/i),             { target: { value: 'STUDENT' } });

    const [pwdInput, confirmInput] = screen.getAllByLabelText(/Password\*/i);
    fireEvent.change(pwdInput,     { target: { value: 'Password1!' } });
    fireEvent.change(confirmInput, { target: { value: 'Different1!' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data when data is valid', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateUserForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/First Name\*/i),       { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/Last Name\*/i),        { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText(/Email\*/i),            { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/Role\*/i),             { target: { value: 'INSTRUCTOR' } });

    const [pwdIn, confirmIn] = screen.getAllByLabelText(/Password\*/i);
    fireEvent.change(pwdIn,     { target: { value: 'Password1!' } });
    fireEvent.change(confirmIn, { target: { value: 'Password1!' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await screen.findByText(/Success!/i);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      role: 'INSTRUCTOR',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    } as UserFormData);
  });
});
