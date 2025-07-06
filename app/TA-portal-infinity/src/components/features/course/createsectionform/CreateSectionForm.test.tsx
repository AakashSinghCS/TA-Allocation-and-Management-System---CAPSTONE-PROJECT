import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CreateSectionForm, { type CreateSectionData } from './CreateSectionForm';

// Mock UserBrowsingViewer to avoid useAuth errors
vi.mock('../../../../pages/userbrowsingpage/userbrowsingviewer/UserBrowsingViewer', () => ({
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

    // Change the semester dropdown
    const semesterSelect = screen.getByLabelText(/Semester/i);
    fireEvent.change(semesterSelect, { target: { value: 'S1' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Section/i });
    fireEvent.click(submitButton);

    expect(onCreate).toHaveBeenCalledTimes(1);
    const submitted = onCreate.mock.calls[0][0];
    expect(submitted.semester).toBe('S1');
  });
});