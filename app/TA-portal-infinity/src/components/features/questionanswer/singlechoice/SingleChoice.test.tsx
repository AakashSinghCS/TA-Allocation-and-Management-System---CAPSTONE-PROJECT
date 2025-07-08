import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useState } from 'react';
import { mockTaProfileQuestion1 } from '../../../../mocked-objects/profile/mockTaProfileQuestions';
import { SingleChoice } from './SingleChoice';

function SingleChoiceTestWrapper() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <SingleChoice
      question={mockTaProfileQuestion1}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  );
}

describe('<SingleChoice />', () => {
  it('renders all answers and calls onSelect with the chosen id', async () => {
    render(<SingleChoiceTestWrapper />);

    expect(screen.getByText(mockTaProfileQuestion1.description!)).toBeInTheDocument();

    const yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    const noRadio = screen.getByLabelText('No') as HTMLInputElement;
    expect(yesRadio).toBeInTheDocument();
    expect(noRadio).toBeInTheDocument();
    expect(yesRadio.checked).toBe(false);
    expect(noRadio.checked).toBe(false);

    fireEvent.click(yesRadio);
    expect(yesRadio.checked).toBe(true);
    expect(noRadio.checked).toBe(false);

    fireEvent.click(noRadio);
    expect(yesRadio.checked).toBe(false);
    expect(noRadio.checked).toBe(true);
  });
});
