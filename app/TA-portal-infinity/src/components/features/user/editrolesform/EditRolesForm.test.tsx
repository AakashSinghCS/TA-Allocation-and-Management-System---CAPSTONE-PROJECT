import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditRolesForm from './EditRolesForm';
import { UserRole } from '../../../../interfaces/enum/UserRole';

describe('EditRolesForm', () => {
  let onSave: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;
  const currentRoles: UserRole[] = ['STUDENT'];

  beforeEach(() => {
    onSave = vi.fn().mockResolvedValue(undefined);
    onCancel = vi.fn();
  });

  it('renders the form with current roles checked', () => {
    render(
      <EditRolesForm
        currentRoles={currentRoles}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Manage Roles')).toBeInTheDocument();
    expect(screen.getByText('Update user role assignments')).toBeInTheDocument();
    
    // Check that STUDENT is checked and others are not
    const studentCheckbox = screen.getByLabelText('STUDENT');
    const instructorCheckbox = screen.getByLabelText('INSTRUCTOR');
    const coordinatorCheckbox = screen.getByLabelText('COORDINATOR');
    const adminCheckbox = screen.getByLabelText('ADMIN');

    expect(studentCheckbox).toBeChecked();
    expect(instructorCheckbox).not.toBeChecked();
    expect(coordinatorCheckbox).not.toBeChecked();
    expect(adminCheckbox).not.toBeChecked();
  });

  it('renders all role options', () => {
    render(
      <EditRolesForm
        currentRoles={currentRoles}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('STUDENT')).toBeInTheDocument();
    expect(screen.getByText('INSTRUCTOR')).toBeInTheDocument();
    expect(screen.getByText('COORDINATOR')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('toggles role selection when clicked', () => {
    render(
      <EditRolesForm
        currentRoles={currentRoles}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const instructorCheckbox = screen.getByLabelText('INSTRUCTOR');
    
    // Initially unchecked
    expect(instructorCheckbox).not.toBeChecked();
    
    // Click to check
    fireEvent.click(instructorCheckbox);
    expect(instructorCheckbox).toBeChecked();
    
    // Click again to uncheck
    fireEvent.click(instructorCheckbox);
    expect(instructorCheckbox).not.toBeChecked();
  });

  it('calls onSave with selected roles when Save Changes is clicked', async () => {
    render(
      <EditRolesForm
        currentRoles={currentRoles}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Add INSTRUCTOR role
    const instructorCheckbox = screen.getByLabelText('INSTRUCTOR');
    fireEvent.click(instructorCheckbox);

    // Submit the form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(['STUDENT', 'INSTRUCTOR']);
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <EditRolesForm
        currentRoles={currentRoles}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows loading state during save', async () => {
    // Mock a slow save operation
    onSave = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <EditRolesForm
        currentRoles={currentRoles}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Wait for save to complete
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('handles multiple role selections correctly', () => {
    render(
      <EditRolesForm
        currentRoles={['STUDENT', 'INSTRUCTOR']}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Both roles should be checked initially
    expect(screen.getByLabelText('STUDENT')).toBeChecked();
    expect(screen.getByLabelText('INSTRUCTOR')).toBeChecked();
    expect(screen.getByLabelText('COORDINATOR')).not.toBeChecked();
    expect(screen.getByLabelText('ADMIN')).not.toBeChecked();
  });

  it('can remove existing roles', async () => {
    render(
      <EditRolesForm
        currentRoles={['STUDENT', 'INSTRUCTOR']}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Remove STUDENT role
    const studentCheckbox = screen.getByLabelText('STUDENT');
    fireEvent.click(studentCheckbox);

    // Submit
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(['INSTRUCTOR']);
    });
  });
});
