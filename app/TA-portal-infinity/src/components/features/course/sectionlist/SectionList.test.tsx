import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SectionList from './SectionList';
import type Section from '../../../../interfaces/section/Section';

describe('SectionList', () => {
  it('renders "No section found." when sections is empty or null', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SectionList sections={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText(/No section found\./i)).toBeInTheDocument();

    // rerender also wrapped
    rerender(
      <MemoryRouter>
        <SectionList sections={null} />
      </MemoryRouter>
    );
    expect(screen.getByText(/No section found\./i)).toBeInTheDocument();
  });

  it('renders a table row with correct link, fields, and times', () => {
    const mockSections: Section[] = [
      {
        sectionDetails: {
          deptCode: 'COSC',
          courseNum: '111',
          section: '001',
          name: 'Intro to CS',
          year: 2024,
          semester: 'W1',
          type: 'Lecture',
        },
        sectionSchedule: [
          { day: 'Monday', startTime: '08:00', endTime: '09:30', sectionId: 1 },
          { day: 'Tuesday', startTime: '10:00', endTime: '11:00', sectionId: 1 },
        ],
      },
    ];

    render(
      <MemoryRouter>
        <SectionList sections={mockSections} />
      </MemoryRouter>
    );

    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('W1')).toBeInTheDocument();
    expect(screen.getByText('Lecture')).toBeInTheDocument();
    expect(screen.getByText('Mon-08:00-09:30, Tue-10:00-11:00')).toBeInTheDocument();
  });
});
