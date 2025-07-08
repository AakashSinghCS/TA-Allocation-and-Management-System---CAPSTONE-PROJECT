import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useState } from 'react';
import { mockTaProfileQuestion3 } from '../../../../mocked-objects/profile/mockTaProfileQuestions';
import { FreeText } from './FreeText';

function FreeTextTestWrapper() {
  const [text, setText] = useState<string>("");
  return (
    <FreeText
      question={mockTaProfileQuestion3}
      text={text}
      onChange={setText}
    />
  );
}

describe('<FreeText />', () => {
  it('can fill out the text', async () => {
    render(<FreeTextTestWrapper />);

    expect(screen.getByText(mockTaProfileQuestion3.description!)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText('Type your answer here...') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('');

    fireEvent.change(textarea, { target: { value: 'I am interested in TAing this course.' } });

    expect(textarea.value).toBe('I am interested in TAing this course.');
  });
});
