import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';

import QuestionItem, {
  type StudentResponseDto
} from './QuestionItem';

import {
  mockTaProfileQuestion1,
  mockTaProfileQuestion2,
  mockTaProfileQuestion3
} from '../../../../mocked-objects/profile/mockTaProfileQuestions';

/* ------------------------------------------------------------------ *
 *  R E S P O N D   M O D E  (editing = false)
 * ------------------------------------------------------------------ */
describe('<QuestionItem /> — respond-mode', () => {
  it('handles SINGLE-choice questions', () => {
    const onChange = vi.fn();

    render(
      <QuestionItem
        initialQuestion={mockTaProfileQuestion1}
        responseValue={undefined}
        onChange={onChange}
      />
    );

    const firstLabel = mockTaProfileQuestion1.answers![0].description!;
    fireEvent.click(screen.getByLabelText(firstLabel));

    expect(onChange).toHaveBeenCalledWith({
      questionId: mockTaProfileQuestion1.id,
      answerIds: [mockTaProfileQuestion1.answers![0].id],
      answerText: ''
    });
  });

  /* helper component so we can keep local state */
  function MultiChoiceWrapper() {
    const [val, setVal] = useState<StudentResponseDto>({
      questionId: mockTaProfileQuestion2.id,
      answerIds: [],
      answerText: ''
    });

    return (
      <QuestionItem
        initialQuestion={mockTaProfileQuestion2}
        responseValue={val}
        onChange={setVal}
      />
    );
  }

  it('handles MULTI-choice questions', () => {
    render(<MultiChoiceWrapper />);

    const [a, b] = mockTaProfileQuestion2.answers!;
    fireEvent.click(screen.getByLabelText(a.description!));
    fireEvent.click(screen.getByLabelText(b.description!));

    const checkboxA = screen.getByLabelText(a.description!) as HTMLInputElement;
    const checkboxB = screen.getByLabelText(b.description!) as HTMLInputElement;

    expect(checkboxA.checked).toBe(true);
    expect(checkboxB.checked).toBe(true);
  });

  it('handles FREE-TEXT questions', () => {
    const onChange = vi.fn();

    render(
      <QuestionItem
        initialQuestion={mockTaProfileQuestion3}
        responseValue={undefined}
        onChange={onChange}
      />
    );

    const textarea = screen.getByPlaceholderText(
      /type your answer here/i
    ) as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: 'My free-form answer.' } });

    expect(onChange).toHaveBeenCalledWith({
      questionId: mockTaProfileQuestion3.id,
      answerIds: [],
      answerText: 'My free-form answer.'
    });
  });
});



describe('<QuestionItem /> — edit-mode', () => {
  function EditWrapper() {
    const [editing, setEditing] = useState(true); 
    const [q, setQ] = useState(mockTaProfileQuestion1);

    return editing ? (
      <QuestionItem
        initialQuestion={{ ...q, id: undefined }} 
        onSaved={(saved) => {
          setEditing(false);
          setQ(saved);
        }}
        onRemoved={() => {}}
      />
    ) : null;
  }

  it('lets a coordinator update description, type, and answers', () => {
    render(<EditWrapper />);

    const descInput = screen.getByLabelText(/text/i) as HTMLInputElement;
    fireEvent.change(descInput, { target: { value: 'Updated description' } });
    expect(descInput.value).toBe('Updated description');

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'FREE_TEXT' } });
    expect(select.value).toBe('FREE_TEXT');
    expect(screen.queryByPlaceholderText(/option 1/i)).toBeNull();

    fireEvent.change(select, { target: { value: 'MULTI' } });
    const firstAnswerInput = screen.getByPlaceholderText(/option 1/i) as HTMLInputElement;
    fireEvent.change(firstAnswerInput, { target: { value: 'Updated label' } });
    expect(firstAnswerInput.value).toBe('Updated label');
  });
});
