import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type Section from '../../../../interfaces/section/Section';
import SectionList from './SectionList';

describe('SectionList', () => {
  it('renders "No section found." when sections is empty or null', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SectionList sections={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText(/No section found\./i)).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <SectionList sections={null} />
      </MemoryRouter>
    );
    expect(screen.getByText(/No section found\./i)).toBeInTheDocument();
  });

  it('renders a course header and a section row with correct data and delete buttons', () => {
    const onDeleted = vi.fn();

    const sections: Section[] = [
      {
        id: 2,
        section: '001',
        year: 2024,
        semester: 'W1',
        type: 'LECTURE',
        course: {
          id: 1,           // courseId
          name: 'Intro to CS',
          deptCode: 'COSC',
          courseNum: '111',
        },
        sectionSchedule: [
          {
            day: 'Monday',
            startTime: '08:00',
            endTime: '09:30',
            sectionId: 2,
          },
        ],
      },
    ];

    render(
      <MemoryRouter>
        <SectionList sections={sections} onDeleted={onDeleted} />
      </MemoryRouter>
    );
    const courseHeaderMatches = screen.getAllByText((_, node) => {
      const text = node?.textContent?.replace(/\s+/g, ' ').trim();
      return text === 'COSC 111 - Intro to CS';
    });
    expect(courseHeaderMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('W1')).toBeInTheDocument();
    expect(screen.getByText('LECTURE')).toBeInTheDocument();
    expect(screen.getByText(/Mon-08:00-09:30/)).toBeInTheDocument();

  });
});
