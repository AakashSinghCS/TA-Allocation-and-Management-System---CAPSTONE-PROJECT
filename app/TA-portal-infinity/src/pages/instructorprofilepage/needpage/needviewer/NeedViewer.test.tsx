import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NeedViewer from './NeedViewer';
import { mockSectionCOSC111 as s111 } from '../../../../mocked-objects/section/mockSectionCOSC111';
import { mockSectionCOSC121 as s121 } from '../../../../mocked-objects/section/mockSectionCOSC121';

const instructorId = 10;

const renderer = () =>
  render(
    <MemoryRouter>
      <NeedViewer
        instructorId={instructorId}
        initial={[s111, s121]}
      />
    </MemoryRouter>
  );

describe('<NeedViewer />', () => {
  it('renders one section, need, and allocation card for each section', () => {
    renderer();

    // two SectionCards
    expect(
      screen.getByTestId(`section-card-${s111.sectionDetails?.id}`)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`section-card-${s121.sectionDetails?.id}`)
    ).toBeInTheDocument();

    expect(screen.getAllByTestId('need-card')).toHaveLength(1);

    expect(screen.getAllByTestId('allocation-card')).toHaveLength(1);
  });
});
