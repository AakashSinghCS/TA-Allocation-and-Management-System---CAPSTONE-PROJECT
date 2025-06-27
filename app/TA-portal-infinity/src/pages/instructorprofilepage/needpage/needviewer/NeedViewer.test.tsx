import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

import NeedViewer from './NeedViewer';
import { mockSectionCOSC111 as s111 } from '../../../../mocked-objects/section/mockSectionCOSC111';
import { mockSectionCOSC121 as s121 } from '../../../../mocked-objects/section/mockSectionCOSC121';

vi.mock('../../../../utility/genericapicontainer/GenericAPIContainer', () => {
  return {
    GenericAPIContainer: (props: any) => props.render([s111, s121]),
  };
});

const arbitaryId = 10;

const renderer = () =>
  render(
    <MemoryRouter>
      <NeedViewer instructorId={arbitaryId} />
    </MemoryRouter>
  );

describe('<NeedViewer />', () => {
  it('shows courses, needs, and ta allocations', () => {
    renderer();

    // Check for COSC 111 and COSC 121
    const headings = screen.getAllByText(/cosc\s*111/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cosc\s*121/i).length).toBeGreaterThan(0);

<<<<<<< HEAD
    // Check for multiple 'need-card' elements
    const needCards = screen.getAllByTestId('need-card');
    
    // Loop over each 'need-card' and check for 'math 125'
    needCards.forEach((needCard) => {
      expect(within(needCard).getAllByText(/math\s*125/i).length).toBeGreaterThan(0);
    });
=======
    const needCard = screen.getByTestId('need-card');
    expect(within(needCard).getAllByText(/math\s*125/i).length).toBeGreaterThan(0);
>>>>>>> origin/develop

    // Check for 'allocation-card' and find "Emma"
    const alloCard = screen.getByTestId('allocation-card');
    const emmaElements = within(alloCard).getAllByText(/emma/i);
    expect(emmaElements.length).toBeGreaterThan(0);
  });
});
