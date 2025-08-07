import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import AddTermForm from './AddTermForm';
import { addSemester } from '../../../api/semester/addSemester';
import { getAllSemesters } from '../../../api/semester/getAllSemesters';
import type { Semester } from '../../../interfaces/semester/Semester';

// Mock the API functions
vi.mock('../../../api/semester/addSemester');
vi.mock('../../../api/semester/getAllSemesters');
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
];

describe('AddTermForm', () => {
  const mockToken = 'test-token';
  const mockOnTermAdded = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    expect(screen.getByText('Add New Term')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toBeInTheDocument();
    expect(screen.getByLabelText('Semester')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Active')).toBeInTheDocument();
    expect(screen.getByText('Add Term')).toBeInTheDocument();
  });

  it('initializes with current year', () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const yearInput = screen.getByLabelText('Year') as HTMLInputElement;
    expect(yearInput.value).toBe(new Date().getFullYear().toString());
  });

  it('initializes with W1 semester', () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const semesterSelect = screen.getByLabelText('Semester') as HTMLSelectElement;
    expect(semesterSelect.value).toBe('W1');
  });

  it('initializes with Active checkbox checked', () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const activeCheckbox = screen.getByLabelText('Active') as HTMLInputElement;
    expect(activeCheckbox.checked).toBe(true);
  });

  it('updates year when changed', async () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const yearInput = screen.getByLabelText('Year');
    await user.clear(yearInput);
    await user.type(yearInput, '2025');
    
    expect((yearInput as HTMLInputElement).value).toBe('2025');
  });

  it('updates semester when changed', async () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const semesterSelect = screen.getByLabelText('Semester');
    await user.selectOptions(semesterSelect, 'S1');
    
    expect((semesterSelect as HTMLSelectElement).value).toBe('S1');
  });

  it('updates start date when changed', async () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    await user.type(startDateInput, '2024-01-08');
    
    expect((startDateInput as HTMLInputElement).value).toBe('2024-01-08');
  });

  it('updates end date when changed', async () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const endDateInput = screen.getByLabelText('End Date');
    await user.type(endDateInput, '2024-04-12');
    
    expect((endDateInput as HTMLInputElement).value).toBe('2024-04-12');
  });

  it('updates active checkbox when changed', async () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const activeCheckbox = screen.getByLabelText('Active') as HTMLInputElement;
    expect(activeCheckbox.checked).toBe(true);
    
    await user.click(activeCheckbox);
    expect(activeCheckbox.checked).toBe(false);
    
    await user.click(activeCheckbox);
    expect(activeCheckbox.checked).toBe(true);
  });

  it('shows error when start date is missing', async () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const endDateInput = screen.getByLabelText('End Date');
    await user.type(endDateInput, '2024-04-12');
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    expect(toast.error).toHaveBeenCalledWith('Both start and end dates must be specified.');
  });

  it('shows error when end date is missing', async () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    await user.type(startDateInput, '2024-01-08');
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    expect(toast.error).toHaveBeenCalledWith('Both start and end dates must be specified.');
  });

  it('shows error when start date is after end date', async () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    await user.type(startDateInput, '2024-04-12');
    await user.type(endDateInput, '2024-01-08');
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    expect(toast.error).toHaveBeenCalledWith('Start date must be before end date.');
  });

  it('shows error when year does not match start date year', async () => {
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const yearInput = screen.getByLabelText('Year');
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    await user.clear(yearInput);
    await user.type(yearInput, '2025');
    await user.type(startDateInput, '2024-01-08');
    await user.type(endDateInput, '2024-04-12');
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    expect(toast.error).toHaveBeenCalledWith('Year must match the start date\'s year.');
  });

  it('successfully submits valid form', async () => {
    vi.mocked(addSemester).mockResolvedValue(true);
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const yearInput = screen.getByLabelText('Year');
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    await user.clear(yearInput);
    await user.type(yearInput, '2024');
    await user.type(startDateInput, '2024-01-08');
    await user.type(endDateInput, '2024-04-12');
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(addSemester).toHaveBeenCalledWith({
        year: 2024,
        semester: 'W1',
        startDate: '2024-01-08',
        endDate: '2024-04-12',
        isActive: true,
      }, mockToken);
    });
    
    expect(toast.success).toHaveBeenCalledWith('Term configuration saved successfully!');
    expect(mockOnTermAdded).toHaveBeenCalledWith(mockSemesters);
  });

  it('submits form with inactive checkbox when unchecked', async () => {
    vi.mocked(addSemester).mockResolvedValue(true);
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const yearInput = screen.getByLabelText('Year');
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    const activeCheckbox = screen.getByLabelText('Active');
    
    await user.clear(yearInput);
    await user.type(yearInput, '2024');
    await user.type(startDateInput, '2024-01-08');
    await user.type(endDateInput, '2024-04-12');
    await user.click(activeCheckbox); // Uncheck it
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(addSemester).toHaveBeenCalledWith({
        year: 2024,
        semester: 'W1',
        startDate: '2024-01-08',
        endDate: '2024-04-12',
        isActive: false, // Should be false when unchecked
      }, mockToken);
    });
  });

  it('shows loading state while submitting', async () => {
    vi.mocked(addSemester).mockImplementation(() => new Promise(() => {}));
    
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    await user.type(startDateInput, '2025-01-08');
    await user.type(endDateInput, '2025-04-12');
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles duplicate entry error (409)', async () => {
    const error = {
      response: {
        status: 409,
        data: 'Duplicate Entry',
      },
    };
    vi.mocked(addSemester).mockRejectedValue(error);
    
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    await user.type(startDateInput, '2025-01-08');
    await user.type(endDateInput, '2025-04-12');
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('This semester already exists. Please choose a different year and semester combination.');
    });
  });

  it('handles bad request error (400)', async () => {
    const error = {
      response: {
        status: 400,
        data: 'Start date must be before end date',
      },
    };
    vi.mocked(addSemester).mockRejectedValue(error);
    
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    await user.type(startDateInput, '2025-01-08');
    await user.type(endDateInput, '2025-04-12');
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Start date must be before end date.');
    });
  });

  it('handles network error', async () => {
    const error = {
      request: {},
      message: 'Network Error',
    };
    vi.mocked(addSemester).mockRejectedValue(error);
    
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    await user.type(startDateInput, '2025-01-08');
    await user.type(endDateInput, '2025-04-12');
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error. Please check your connection and try again.');
    });
  });

  it('resets form after successful submission', async () => {
    vi.mocked(addSemester).mockResolvedValue(true);
    vi.mocked(getAllSemesters).mockResolvedValue(mockSemesters);
    
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    
    const yearInput = screen.getByLabelText('Year') as HTMLInputElement;
    const semesterSelect = screen.getByLabelText('Semester') as HTMLSelectElement;
    const startDateInput = screen.getByLabelText('Start Date') as HTMLInputElement;
    const endDateInput = screen.getByLabelText('End Date') as HTMLInputElement;
    const activeCheckbox = screen.getByLabelText('Active') as HTMLInputElement;
    
    await user.clear(yearInput);
    await user.type(yearInput, '2025');
    await user.selectOptions(semesterSelect, 'S1');
    await user.type(startDateInput, '2025-01-08');
    await user.type(endDateInput, '2025-04-12');
    await user.click(activeCheckbox); // Uncheck it
    
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(yearInput.value).toBe(new Date().getFullYear().toString());
      expect(semesterSelect.value).toBe('W1');
      expect(startDateInput.value).toBe('');
      expect(endDateInput.value).toBe('');
      expect(activeCheckbox.checked).toBe(true); // Should reset to true
    });
  });

  it('shows error when save fails', async () => {
    vi.mocked(addSemester).mockResolvedValue(false);
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    await user.type(startDateInput, '2025-01-08');
    await user.type(endDateInput, '2025-04-12');
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save term configuration.');
    });
  });

  it('handles not found error (404)', async () => {
    const error = { response: { status: 404, data: 'Not Found' } };
    vi.mocked(addSemester).mockRejectedValue(error);
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    await user.type(startDateInput, '2025-01-08');
    await user.type(endDateInput, '2025-04-12');
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Resource not found.');
    });
  });

  it('handles internal server error (500)', async () => {
    const error = { response: { status: 500, data: 'Server error' } };
    vi.mocked(addSemester).mockRejectedValue(error);
    render(<AddTermForm token={mockToken} onTermAdded={mockOnTermAdded} />);
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    await user.type(startDateInput, '2025-01-08');
    await user.type(endDateInput, '2025-04-12');
    const submitButton = screen.getByText('Add Term');
    await user.click(submitButton);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Internal server error. Please try again later.');
    });
  });
});
