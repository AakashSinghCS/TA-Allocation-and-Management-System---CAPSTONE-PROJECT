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
    expect(screen.getByText(/No Requirements Set/i)).toBeInTheDocument();
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

    // Test for individual parts of the text that appear
    expect(screen.getByText('Comments:')).toBeInTheDocument();
    expect(screen.getByText('I need smart people')).toBeInTheDocument();
    expect(screen.getByText('Hours:')).toBeInTheDocument();
    expect(screen.getAllByText('12')).toHaveLength(2); // Both allocated and required hours
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('Prerequisites:')).toBeInTheDocument();

    // each prereq course link
    need.prerequisites!.forEach((course) => {
      const regex = new RegExp(`${course.deptCode}\\s*${course.courseNum}`, 'i');
      expect(within(card).getByText(regex)).toBeInTheDocument();
    });
  });
});
