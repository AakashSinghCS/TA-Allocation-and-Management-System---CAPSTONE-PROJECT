import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import ExistingTermsTable from './ExistingTermsTable';
import { updateSemester } from '../../../api/semester/updateSemester';
import { deleteSemester } from '../../../api/semester/deleteSemester';
import { getAllSemesters } from '../../../api/semester/getAllSemesters';
import { showToastConfirmation } from '../../../utility/confirmation/toastConfirmation';
import type { Semester } from '../../../interfaces/semester/Semester';

// Mock the API functions and utilities
vi.mock('../../../api/semester/updateSemester');
vi.mock('../../../api/semester/deleteSemester');
vi.mock('../../../api/semester/getAllSemesters');
vi.mock('../../../utility/confirmation/toastConfirmation');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockSemesters: Semester[] = [
  {
    id: 1,
    year: 2024,
    semester: 'W1',
    startDate: '2024-01-08',
    endDate: '2024-04-12',
    isActive: true,
  },
  {
    id: 2,
    year: 2024,
    semester: 'S1',
    startDate: '2024-05-06',
    endDate: '2024-08-16',
    isActive: false,
  },
  {
    id: 3,
    year: 2023,
    semester: 'W2',
    startDate: '2023-09-05',
    endDate: '2023-12-15',
    isActive: false,
  },
];

describe('ExistingTermsTable', () => {
  const mockToken = 'test-token';
  const mockOnSemestersUpdated = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={[]}
        semestersLoading={true}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    expect(screen.getByText('Loading terms...')).toBeInTheDocument();
  });

  it('renders no terms message when no semesters', () => {
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={[]}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    expect(screen.getByText('No terms found.')).toBeInTheDocument();
  });

  it('renders table with semesters', () => {
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    expect(screen.getByText('Existing Terms')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Semester')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Check semester data
    expect(screen.getAllByText('2024')).toHaveLength(2);
    expect(screen.getByText('W1')).toBeInTheDocument();
    expect(screen.getByText('2024-01-08')).toBeInTheDocument();
    expect(screen.getByText('2024-04-12')).toBeInTheDocument();
  });

  it('displays only first 5 semesters initially', () => {
    const manySemesters = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      year: 2024,
      semester: 'W1' as const,
      startDate: '2024-01-08',
      endDate: '2024-04-12',
      isActive: false,
    }));

    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={manySemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    expect(screen.getByText('Show More (5 remaining)')).toBeInTheDocument();
  });

  it('shows more semesters when Show More is clicked', async () => {
    const manySemesters = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      year: 2024,
      semester: 'W1' as const,
      startDate: '2024-01-08',
      endDate: '2024-04-12',
      isActive: false,
    }));

    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={manySemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const showMoreButton = screen.getByText('Show More (5 remaining)');
    await user.click(showMoreButton);
    
    expect(screen.queryByText('Show More')).not.toBeInTheDocument();
  });

  it('enters edit mode when Edit button is clicked', async () => {
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Check if inputs are rendered
    expect(screen.getByDisplayValue('2024')).toBeInTheDocument();
    expect(screen.getByDisplayValue('W1')).toBeInTheDocument();
  });

  it('cancels edit mode when Cancel button is clicked', async () => {
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.getAllByText('Edit')).toHaveLength(3);
  });

  it('validates dates when saving edit', async () => {
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    // Set end date before start date
    const startDateInput = screen.getByDisplayValue('2024-01-08');
    const endDateInput = screen.getByDisplayValue('2024-04-12');
    
    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-06-01');
    await user.clear(endDateInput);
    await user.type(endDateInput, '2024-03-01');
    
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    expect(toast.error).toHaveBeenCalledWith('Start date must be before end date.');
  });

  it('validates year matches start date when saving edit', async () => {
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    // Set year different from start date year
    const yearInput = screen.getByDisplayValue('2024');
    const startDateInput = screen.getByDisplayValue('2024-01-08');
    
    await user.clear(yearInput);
    await user.type(yearInput, '2025');
    
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    expect(toast.error).toHaveBeenCalledWith('Year must match the start date\'s year.');
  });

  it('successfully saves edit', async () => {
    vi.mocked(updateSemester).mockResolvedValue(true);
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    const yearInput = screen.getByDisplayValue('2024');
    await user.clear(yearInput);
    await user.type(yearInput, '2025');
    
    const startDateInput = screen.getByDisplayValue('2024-01-08');
    await user.clear(startDateInput);
    await user.type(startDateInput, '2025-01-08');
    
    const endDateInput = screen.getByDisplayValue('2024-04-12');
    await user.clear(endDateInput);
    await user.type(endDateInput, '2025-04-12');
    
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(updateSemester).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          year: 2025,
          startDate: '2025-01-08',
          endDate: '2025-04-12',
        }),
        mockToken
      );
    });
    
    expect(toast.success).toHaveBeenCalledWith('Semester updated successfully!');
    expect(mockOnSemestersUpdated).toHaveBeenCalledWith(mockSemesters);
  });

  it('handles update error', async () => {
    const error = {
      response: {
        status: 404,
        data: 'Not found',
      },
    };
    vi.mocked(updateSemester).mockRejectedValue(error);
    
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No semester found with the specified ID.');
    });
  });

  it('shows confirmation dialog before delete', async () => {
    vi.mocked(showToastConfirmation).mockResolvedValue(false);
    
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    expect(showToastConfirmation).toHaveBeenCalledWith({
      title: 'Delete Semester',
      message: 'Are you sure you want to delete the semester 2024 W1? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
  });

  it('deletes semester when confirmed', async () => {
    vi.mocked(showToastConfirmation).mockResolvedValue(true);
    vi.mocked(deleteSemester).mockResolvedValue(true);
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters.slice(1));
    
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(deleteSemester).toHaveBeenCalledWith(1, mockToken);
    });
    
    expect(toast.success).toHaveBeenCalledWith('Semester deleted successfully!');
    expect(mockOnSemestersUpdated).toHaveBeenCalledWith(mockSemesters.slice(1));
  });

  it('does not delete when cancelled', async () => {
    vi.mocked(showToastConfirmation).mockResolvedValue(false);
    
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    expect(deleteSemester).not.toHaveBeenCalled();
  });

  it('handles delete error', async () => {
    vi.mocked(showToastConfirmation).mockResolvedValue(true);
    const error = {
      response: {
        status: 404,
        data: 'Not found',
      },
    };
    vi.mocked(deleteSemester).mockRejectedValue(error);
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Semester not found. It may have already been deleted.');
    });
    
    // Should reload semesters after 404 error
    expect(getAllSemesters).toHaveBeenCalledWith(mockToken);
    expect(mockOnSemestersUpdated).toHaveBeenCalledWith(mockSemesters);
  });

  it('updates checkbox values during edit', async () => {
    render(
      <ExistingTermsTable
        token={mockToken}
        semesters={mockSemesters}
        semestersLoading={false}
        onSemestersUpdated={mockOnSemestersUpdated}
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const editableCheckbox = checkboxes.find(cb => !cb.hasAttribute('readonly'));
    
    expect(editableCheckbox).toBeDefined();
    if (editableCheckbox) {
      await user.click(editableCheckbox);
      expect(editableCheckbox).not.toBeChecked();
    }
  });
});
