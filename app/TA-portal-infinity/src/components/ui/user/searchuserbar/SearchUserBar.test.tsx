import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchUserBar, { type SearchCriteria } from './SearchUserBar';

vi.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({ userRoles: ['COORDINATOR'] as const }),
}));

describe('SearchUserBar', () => {
  it('renders inputs and calls onSearch with the correct criteria', async () => {
    const mockOnSearch = vi.fn().mockResolvedValue(undefined);

    render(<SearchUserBar onSearch={mockOnSearch} loading={false} />);

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText(/University Number/), { target: { value: '12345678' } });


    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        role: '',
        firstname: '',
        lastname: '',
        universityNumber: '12345678',
        userId: '',
      } as SearchCriteria);
    });
  });

  it('disables the button and shows "Searching…" when loading is true', () => {
    render(<SearchUserBar onSearch={() => Promise.resolve()} loading={true} />);

    const button = screen.getByRole('button', { name: /searching…/i });
    expect(button).toBeDisabled();
  });

  it('only shows allowed roles when provided', () => {
    render(
      <SearchUserBar
        onSearch={() => Promise.resolve()}
        loading={false}
        allowedRoles={['Student']}
      />
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[1]).toHaveTextContent('Student');
  });
});
