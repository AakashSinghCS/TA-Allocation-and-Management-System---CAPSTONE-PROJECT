import { render, screen, fireEvent } from '@testing-library/react';
import AuditFilters, { ACTION_OPTIONS } from './AuditFilters';
import { toast } from 'react-toastify';
import { vi } from 'vitest';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('AuditFilters', () => {
  const defaultProps = {
    service: '',
    entity: '',
    entityId: 0,
    action: '',
    actorId: 0,
    when: '2025-07-16',
    onServiceChange: vi.fn(),
    onEntityChange: vi.fn(),
    onEntityIdChange: vi.fn(),
    onActionChange: vi.fn(),
    onActorIdChange: vi.fn(),
    onWhenChange: vi.fn(),
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all fields with initial prop values', () => {
    render(<AuditFilters {...defaultProps} />);

    // Service select with placeholder
    const serviceSelect = screen.getByLabelText(/service/i);
    expect(serviceSelect).toHaveValue('');

    // Entity input
    expect(screen.getByPlaceholderText(/entity name/i)).toHaveValue('');

    // Entity ID input
    expect(screen.getByPlaceholderText(/^ID$/i)).toHaveValue(0);

    // Action select has empty selection and options
    const actionSelect = screen.getByLabelText(/action/i);
    expect(actionSelect).toHaveValue('');
    ACTION_OPTIONS.forEach(opt => {
      expect(screen.getByRole('option', { name: opt })).toBeInTheDocument();
    });

    // Actor ID input
    expect(screen.getAllByPlaceholderText(/^ID$/i)[1]).toHaveValue(0);

    // Date input
    expect(screen.getByLabelText(/date/i)).toHaveValue('2025-07-16');

    // Apply button
    expect(screen.getByRole('button', { name: /apply/i })).toBeEnabled();
  });

  it('shows a toast error if service is blank when applying', () => {
    render(<AuditFilters {...defaultProps} service="" />);

    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    expect(toast.error).toHaveBeenCalledWith(
      'Please pick a service before applying filters.'
    );
    // onApply should not be called
    expect(defaultProps.onApply).not.toHaveBeenCalled();
  });

  it('updates drafts on user input and calls callbacks on apply', () => {
    render(<AuditFilters {...defaultProps} />);

    // Change service
    fireEvent.change(screen.getByLabelText(/service/i), {
      target: { value: 'course-service' },
    });
    // Change entity
    fireEvent.change(screen.getByPlaceholderText(/entity name/i), {
      target: { value: 'MyEntity' },
    });
    // Change entityId
    fireEvent.change(screen.getByPlaceholderText(/^ID$/i), {
      target: { value: '123' },
    });
    // Change action
    fireEvent.change(screen.getByLabelText(/action/i), {
      target: { value: ACTION_OPTIONS[1] }, // DELETE
    });
    // Change actorId (second ID input)
    fireEvent.change(screen.getAllByPlaceholderText(/^ID$/i)[1], {
      target: { value: '77' },
    });
    // Change date
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: '2025-01-01' },
    });

    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    // Each onXChange should be called with the draft values
    expect(defaultProps.onServiceChange).toHaveBeenCalledWith('course-service');
    expect(defaultProps.onEntityChange).toHaveBeenCalledWith('MyEntity');
    expect(defaultProps.onEntityIdChange).toHaveBeenCalledWith(123);
    expect(defaultProps.onActionChange).toHaveBeenCalledWith(
      ACTION_OPTIONS[1]
    );
    expect(defaultProps.onActorIdChange).toHaveBeenCalledWith(77);
    expect(defaultProps.onWhenChange).toHaveBeenCalledWith('2025-01-01');

    // Finally onApply
    expect(defaultProps.onApply).toHaveBeenCalledTimes(1);
  });
});
