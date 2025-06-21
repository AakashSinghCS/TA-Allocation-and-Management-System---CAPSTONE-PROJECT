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

const renderComparer = () =>
  render(
    <MemoryRouter>
      <NeedViewer instructorId={arbitaryId} />
    </MemoryRouter>
  );

describe('<NeedViewer />', () => {
  it('shows courses, needs, and ta allocations', () => {
    renderComparer();

    // expect(
    //   screen.getByText(/no courses to display/i)
    // ).toBeInTheDocument();

    // fireEvent.click(screen.getByRole('button', { name: /search/i }));

    const headings = screen.getAllByText(/cosc\s*111/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cosc\s*121/i).length).toBeGreaterThan(0);

    const needCard = screen.getByTestId('need-card');
    // expect(within(needCard).getByText(/math\s*125/i)).toBeInTheDocument();
    expect(within(needCard).getAllByText(/math\s*125/i).length).toBeGreaterThan(0);

    const alloCard = screen.getByTestId('allocation-card');
    const emmaElements = within(alloCard).getAllByText(/emma/i);
    expect(emmaElements.length).toBeGreaterThan(0);
  });


});
