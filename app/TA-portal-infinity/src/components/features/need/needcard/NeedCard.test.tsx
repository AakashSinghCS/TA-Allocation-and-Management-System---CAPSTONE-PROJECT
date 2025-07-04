import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NeedCard from './NeedCard';
import { mockSectionCOSC121 } from '../../../../mocked-objects/section/mockSectionCOSC121';
import type { Need } from '../../../../interfaces/need/Need';

describe('NeedCard', () => {
  it('shows placeholder when no need is passed', () => {
    render(
      <MemoryRouter>
        <NeedCard />
      </MemoryRouter>
    );
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('renders description, hours and prerequisites when need is provided', () => {
    // grab the Need object out of the mock section
    const need : Need = mockSectionCOSC121.need!;
    
    render(
      <MemoryRouter>
        <NeedCard need={need} />
      </MemoryRouter>
    );

    // description
    expect(screen.getByText(need.description!)).toBeInTheDocument();

    const card = screen.getByTestId('need-card');

    // allocated / required hours
    expect(card).toHaveTextContent(
      `Allocated hours: ${need.numHoursCurrentlyAllocated} / Required hours: ${need.requiredGradingHours}`
    );

    // each prereq course link
    need.prerequisites!.forEach((course) => {
      const regex = new RegExp(`${course.deptCode}\\s*${course.courseNum}`, 'i');
      expect(within(card).getByText(regex)).toBeInTheDocument();
    });
  });
});
