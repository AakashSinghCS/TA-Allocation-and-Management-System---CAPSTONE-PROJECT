import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditProfileSection from './EditProfileSection';

describe('EditProfileSection', () => {
  type TestUser = { firstName: string; lastName: string };
  const user: TestUser = { firstName: 'Alice', lastName: 'Smith' };
  const fields = ['firstName', 'lastName'] as (keyof TestUser)[];
  const labels: Record<keyof TestUser, string> = {
    firstName: 'First Name',
    lastName: 'Last Name',
  };

  let onSave: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSave = vi.fn().mockResolvedValue(undefined);
    onCancel = vi.fn();
  });

  it('renders inputs with initial values', () => {
    render(
      <EditProfileSection
        user={user}
        fields={fields}
        labels={labels}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    expect(screen.getByLabelText('First Name')).toHaveValue('Alice');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Smith');
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('submits updated values via onSave', async () => {
    render(
      <EditProfileSection
        user={user}
        fields={fields}
        labels={labels}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Bob' },
    });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        firstName: 'Bob',
        lastName: 'Smith',
      })
    );
  });

  it('shows error message when save fails', async () => {
    onSave = vi.fn().mockRejectedValue(new Error('Save failed'));
    render(
      <EditProfileSection
        user={user}
        fields={fields}
        labels={labels}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText('Save Changes'));
    expect(await screen.findByText('Save failed')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel clicked', () => {
    render(
      <EditProfileSection
        user={user}
        fields={fields}
        labels={labels}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
