import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CreateSectionForm, { type CreateSectionData } from './CreateSectionForm';

describe('CreateSectionForm', () => {
  it('calls onCreateSection with form data when submitted', () => {
    const onCreate = vi.fn();
    render(
      <MemoryRouter>
        <CreateSectionForm onCreateSection={onCreate} />
      </MemoryRouter>
    );

    // fill text inputs
    fireEvent.change(screen.getByLabelText(/Section Name/i), { target: { value: 'Intro to CS' } });
    fireEvent.change(screen.getByLabelText(/Department Code/i), { target: { value: 'COSC' } });
    fireEvent.change(screen.getByLabelText(/Course Number/i), { target: { value: '111' } });
    fireEvent.change(screen.getByLabelText(/Section Code/i), { target: { value: '001' } });
    fireEvent.change(screen.getByLabelText(/Year/i), { target: { value: '2024' } });

    // selects
    fireEvent.change(screen.getByLabelText(/Semester/i), { target: { value: 'W1' } });
    fireEvent.change(screen.getByLabelText(/Section Type/i), { target: { value: 'Lecture' } });
    fireEvent.change(screen.getByLabelText(/Day of Week/i), { target: { value: 'Monday' } });
    fireEvent.change(screen.getByLabelText(/Start Time/i), { target: { value: '08:00' } });
    fireEvent.change(screen.getByLabelText(/End Time/i), { target: { value: '09:30' } });

    // instructor ID
    fireEvent.change(screen.getByLabelText(/Instructor ID/i), { target: { value: '42' } });

    // submit
    fireEvent.click(screen.getByRole('button', { name: /Create Section/i }));

    // assert callback
    expect(onCreate).toHaveBeenCalledWith({
      name: 'Intro to CS',
      deptCode: 'COSC',
      courseNum: '111',
      section: '001',
      year: 2024,
      semester: 'W1',
      type: 'Lecture',
      day: 'Monday',
      startTime: '08:00',
      endTime: '09:30',
      instructorId: 42,
    } as CreateSectionData);
  });
});
