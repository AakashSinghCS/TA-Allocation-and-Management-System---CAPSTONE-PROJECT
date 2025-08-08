import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import DeadlineManagement from './DeadlineManagement';
import { fetchDeadlines, updateDeadline } from '../../../api/admin/FetchDeadline';
import type { DeadlineDto } from '../../../interfaces/admin/Deadline';

// Mock the API functions
vi.mock('../../../api/admin/FetchDeadline');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockDeadlines: DeadlineDto[] = [
  {
    name: 'APPLICATION_DEADLINE',
    startTime: '2024-01-02T10:00:00',
    endTime: '2024-01-15T23:59:00',
  },
  {
    name: 'INTERVIEW_DEADLINE',
    startTime: '2024-01-16T09:00:00',
    endTime: '2024-01-30T18:00:00',
  },
  {
    name: 'FINAL_DECISION_DEADLINE',
    startTime: '2024-02-01T08:00:00',
    endTime: '2024-02-14T17:00:00',
  },
];

describe('DeadlineManagement', () => {
  const mockToken = 'test-token';
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct title', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    expect(screen.getByText('Deadlines')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    vi.mocked(fetchDeadlines).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<DeadlineManagement token={mockToken} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('loads and displays deadlines', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
      expect(screen.getByText('Interview Deadline')).toBeInTheDocument();
      expect(screen.getByText('Final Decision Deadline')).toBeInTheDocument();
    });
    
    expect(fetchDeadlines).toHaveBeenCalledWith(mockToken);
  });

  it('displays table headers correctly', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Deadline Name')).toBeInTheDocument();
      expect(screen.getByText('Start Time')).toBeInTheDocument();
      expect(screen.getByText('End Time')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  it('formats deadline names correctly', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue([
      {
        name: 'APPLICATION_DEADLINE',
        startTime: '2024-01-02T10:00:00',
        endTime: '2024-01-15T23:59:00',
      },
      {
        name: 'FINAL_DECISION_DEADLINE',
        startTime: '2024-02-01T08:00:00',
        endTime: '2024-02-14T17:00:00',
      },
    ]);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
      expect(screen.getByText('Final Decision Deadline')).toBeInTheDocument();
    });
  });

  it('displays datetime inputs with correct values', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      const startTimeInputs = screen.getAllByDisplayValue('2024-01-02T10:00');
      const endTimeInputs = screen.getAllByDisplayValue('2024-01-15T23:59');
      
      expect(startTimeInputs[0]).toBeInTheDocument();
      expect(endTimeInputs[0]).toBeInTheDocument();
    });
  });

  it('updates start time when input changes', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
    });
    
    const startTimeInputs = screen.getAllByDisplayValue('2024-01-02T10:00');
    const firstStartTimeInput = startTimeInputs[0];
    
    await user.clear(firstStartTimeInput);
    await user.type(firstStartTimeInput, '2024-01-05T09:30');
    
    expect((firstStartTimeInput as HTMLInputElement).value).toBe('2024-01-05T09:30');
  });

  it('updates end time when input changes', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
    });
    
    const endTimeInputs = screen.getAllByDisplayValue('2024-01-15T23:59');
    const firstEndTimeInput = endTimeInputs[0];
    
    await user.clear(firstEndTimeInput);
    await user.type(firstEndTimeInput, '2024-01-20T18:00');
    
    expect((firstEndTimeInput as HTMLInputElement).value).toBe('2024-01-20T18:00');
  });

  it('shows error when start time is missing', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
    });
    
    const startTimeInputs = screen.getAllByDisplayValue('2024-01-02T10:00');
    const firstStartTimeInput = startTimeInputs[0];
    
    await user.clear(firstStartTimeInput);
    
    const saveButtons = screen.getAllByText('Save');
    await user.click(saveButtons[0]);
    
    expect(toast.error).toHaveBeenCalledWith('Both start and end time must be specified.');
  });

  it('shows error when end time is missing', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
    });
    
    const endTimeInputs = screen.getAllByDisplayValue('2024-01-15T23:59');
    const firstEndTimeInput = endTimeInputs[0];
    
    await user.clear(firstEndTimeInput);
    
    const saveButtons = screen.getAllByText('Save');
    await user.click(saveButtons[0]);
    
    expect(toast.error).toHaveBeenCalledWith('Both start and end time must be specified.');
  });

  it('shows error when start time is after end time', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
    });
    
    const startTimeInputs = screen.getAllByDisplayValue('2024-01-02T10:00');
    const endTimeInputs = screen.getAllByDisplayValue('2024-01-15T23:59');
    
    await user.clear(startTimeInputs[0]);
    await user.type(startTimeInputs[0], '2024-01-20T10:00');
    
    await user.clear(endTimeInputs[0]);
    await user.type(endTimeInputs[0], '2024-01-10T23:59');
    
    const saveButtons = screen.getAllByText('Save');
    await user.click(saveButtons[0]);
    
    expect(toast.error).toHaveBeenCalledWith('Start time must be before end time.');
  });

  it('successfully saves deadline update', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    vi.mocked(updateDeadline).mockResolvedValue(mockDeadlines[0]);
    
    // Mock second fetch call after update
    vi.mocked(fetchDeadlines).mockResolvedValueOnce(mockDeadlines).mockResolvedValueOnce(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
    });
    
    const startTimeInputs = screen.getAllByDisplayValue('2024-01-02T10:00');
    await user.clear(startTimeInputs[0]);
    await user.type(startTimeInputs[0], '2024-01-05T09:30');
    
    const saveButtons = screen.getAllByText('Save');
    await user.click(saveButtons[0]);
    
    await waitFor(() => {
      expect(updateDeadline).toHaveBeenCalledWith(
        'APPLICATION_DEADLINE',
        expect.objectContaining({
          name: 'APPLICATION_DEADLINE',
          startTime: '2024-01-05T09:30:00',
          endTime: '2024-01-15T23:59:00',
        }),
        mockToken
      );
      expect(toast.success).toHaveBeenCalledWith('Deadline updated successfully!');
    });
  });

  it('handles update error', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    vi.mocked(updateDeadline).mockRejectedValue(new Error('Update failed'));
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
    });
    
    const saveButtons = screen.getAllByText('Save');
    await user.click(saveButtons[0]);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error updating deadline');
    });
  });

  it('shows error toast when updateDeadline throws network error', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    vi.mocked(updateDeadline).mockRejectedValue({ request: {} });
    render(<DeadlineManagement token={mockToken} />);
    await waitFor(() => expect(screen.getByText('Application Deadline')).toBeInTheDocument());
    const saveButtons = screen.getAllByText('Save');
    await user.click(saveButtons[0]);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error updating deadline');
    });
  });

  it('handles fetch error', async () => {
    vi.mocked(fetchDeadlines).mockRejectedValue(new Error('Fetch failed'));
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load deadlines.')).toBeInTheDocument();
    });
  });

  it('displays no deadlines message when empty', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue([]);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('No deadlines found.')).toBeInTheDocument();
    });
  });

  it('renders save button for each deadline', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      const saveButtons = screen.getAllByText('Save');
      expect(saveButtons).toHaveLength(mockDeadlines.length);
    });
  });

  it('renders save button with correct aria-label', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    render(<DeadlineManagement token={mockToken} />);
    await waitFor(() => {
      expect(screen.getByLabelText('save-deadline-APPLICATION_DEADLINE')).toBeInTheDocument();
    });
  });

  it('maintains independent state for each deadline', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Deadline')).toBeInTheDocument();
    });
    
    const startTimeInputs = screen.getAllByDisplayValue('2024-01-02T10:00');
    
    // Update first deadline
    await user.clear(startTimeInputs[0]);
    await user.type(startTimeInputs[0], '2024-01-05T09:30');
    
    // Check that second deadline is unchanged  
    const secondStartTimeInputs = screen.getAllByDisplayValue('2024-01-16T09:00');
    expect((secondStartTimeInputs[0] as HTMLInputElement).value).toBe('2024-01-16T09:00');
  });

  it('handles empty token gracefully', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    
    render(<DeadlineManagement token="" />);
    
    await waitFor(() => {
      expect(fetchDeadlines).toHaveBeenCalledWith('');
    });
  });

  it('formats time correctly for datetime-local inputs', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue([
      {
        name: 'TEST_DEADLINE',
        startTime: '2024-12-25T14:30:45',
        endTime: '2024-12-31T23:59:59',
      },
    ]);
    
    render(<DeadlineManagement token={mockToken} />);
    
    await waitFor(() => {
      // Since we now have both desktop and mobile inputs, use getAllByDisplayValue
      const startInputs = screen.getAllByDisplayValue('2024-12-25T14:30');
      const endInputs = screen.getAllByDisplayValue('2024-12-31T23:59');
      
      // Should have 2 inputs each (desktop and mobile)
      expect(startInputs).toHaveLength(2);
      expect(endInputs).toHaveLength(2);
    });
  });

  it('handles HTTP 400 error response gracefully', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    const error = { response: { status: 400, data: 'Bad Request' } };
    vi.mocked(updateDeadline).mockRejectedValue(error);
    render(<DeadlineManagement token={mockToken} />);
    await waitFor(() => expect(screen.getByText('Application Deadline')).toBeInTheDocument());
    const saveButtons = screen.getAllByText('Save');
    await user.click(saveButtons[0]);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error updating deadline');
    });
  });

  it('handles HTTP 500 error response gracefully', async () => {
    vi.mocked(fetchDeadlines).mockResolvedValue(mockDeadlines);
    const error = { response: { status: 500, data: 'Server error' } };
    vi.mocked(updateDeadline).mockRejectedValue(error);
    render(<DeadlineManagement token={mockToken} />);
    await waitFor(() => expect(screen.getByText('Application Deadline')).toBeInTheDocument());
    const saveButtons = screen.getAllByText('Save');
    await user.click(saveButtons[0]);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error updating deadline');
    });
  });
});
