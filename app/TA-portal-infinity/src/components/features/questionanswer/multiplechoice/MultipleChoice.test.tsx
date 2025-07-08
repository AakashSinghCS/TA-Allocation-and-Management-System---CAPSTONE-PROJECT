import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useState } from 'react';
import { mockTaProfileQuestion2 } from '../../../../mocked-objects/profile/mockTaProfileQuestions';
import { MultipleChoice } from './MultipleChoice';

function MultipleChoiceTestWrapper() {
  const [selected, setToggled] = useState<number[]>([]);
  return (
    <MultipleChoice
      question={mockTaProfileQuestion2}
      selected={selected}
      onToggle={(id, checked)=>{
        const current =selected ?? [];
        const next = checked
              ? [...current, id]
              : current.filter(x => x !== id);
        setToggled( next );
    }}
    />
  );
}

describe('<MutlipleChoice />', () => {
  it('renders all answers and calls onToggle', async () => {
    render(<MultipleChoiceTestWrapper />);

    expect(screen.getByText(mockTaProfileQuestion2.description!)).toBeInTheDocument();

    const javaCheckbox = screen.getByLabelText('Java') as HTMLInputElement;
    const pythonCheckbox = screen.getByLabelText('Python') as HTMLInputElement;
    expect(javaCheckbox).toBeInTheDocument();
    expect(pythonCheckbox).toBeInTheDocument();
    expect(javaCheckbox.checked).toBe(false);
    expect(pythonCheckbox.checked).toBe(false);

    fireEvent.click(javaCheckbox);
    expect(javaCheckbox.checked).toBe(true);

    fireEvent.click(pythonCheckbox);
    expect(javaCheckbox.checked).toBe(true);
    expect(pythonCheckbox.checked).toBe(true);
  });
});
