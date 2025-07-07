import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { mockInstructorQualificationResponse } from '../../../../../mocked-objects/qualification/mockInstructorQualificationResponse';
import InstructorQualificationViewer from './InstructorQualificationViewer';

vi.mock('../../../../../utility/genericapicontainer/GenericAPIContainer', () => {
  return {
    GenericAPIContainer: (props: any) => props.render(mockInstructorQualificationResponse),
  };
});

const arbitaryId = 10;

const renderer = () =>
  render(
    <MemoryRouter>
      <InstructorQualificationViewer instructorId={arbitaryId} />
    </MemoryRouter>
  );

describe('<InstructorQualificationViewer />', () => {
  it('shows courses and description', () => {
    renderer();

    const headings = screen.getAllByText(/cosc\s*111/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/math\s*125/i).length).toBeGreaterThan(0);

    const cards = screen.getAllByTestId('qualification-card');
    expect(cards.length).toBe(mockInstructorQualificationResponse.length);

    const firstCard = cards[0];
    expect(within(firstCard).getAllByText(/10\s*somersaults/i).length).toBeGreaterThan(0);

  });
});
