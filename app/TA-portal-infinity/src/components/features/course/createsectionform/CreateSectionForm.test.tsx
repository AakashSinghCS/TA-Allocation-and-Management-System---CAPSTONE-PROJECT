import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CreateSectionForm, { type CreateSectionData } from './CreateSectionForm';
import { MemoryRouter } from 'react-router-dom';

// Mock UserBrowsingViewer to avoid useAuth errors
vi.mock('../../../../pages/coordinator/userbrowsingpage/userbrowsingviewer/UserBrowsingViewer', () => ({
  default: () => <div data-testid="viewer" />
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


describe('CreateSectionForm', () => {
  it('allows changing semester dropdown and submits updated state', () => {
    const onCreate = vi.fn<(data: CreateSectionData) => void>();
    render(
      <MemoryRouter>
        <CreateSectionForm onCreateSection={onCreate} />
      </MemoryRouter>
    );

    // Fill required fields (match actual label texts)
    fireEvent.change(screen.getByLabelText(/Dept Code/i), { target: { value: 'COSC' } });
    fireEvent.change(screen.getByLabelText(/Course Num/i), { target: { value: '111' } });
    fireEvent.change(screen.getByLabelText(/Section Code/i), { target: { value: '001' } });
    fireEvent.change(screen.getByLabelText(/Year/i), { target: { value: '2025' } });
    fireEvent.change(screen.getByLabelText(/Semester/i), { target: { value: 'S1' } });
    fireEvent.change(screen.getByLabelText(/Section Type/i), { target: { value: 'LECTURE' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Section/i });
    fireEvent.click(submitButton);

    expect(onCreate).toHaveBeenCalledTimes(1);
    const submitted = onCreate.mock.calls[0][0];
    expect(submitted.semester).toBe('S1');
  });
});