import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SectionProfileSection, { createProfileDetails } from '../sectionprofilesection/SectionProfileSection';
import type { SectionProfile } from '../../../../interfaces/section/Section';
import type SectionSchedule from '../../../../interfaces/section/SectionSchedule';
import type Section from '../../../../interfaces/section/Section';

// Dummy data for tests
const dummySection: Section = {
  sectionDetails: {
    id: 2,
    sectionId: 20,
    deptCode: 'COSC',
    courseNum: '111',
    name: 'Intro to CS',
    section: 'A',
    year: 2025,
    semester: 'S1',
    type: 'TUTORIAL',
  },
  sectionSchedule: [
    { id: 1, day: 'Mon', startTime: '08:00', endTime: '09:30' },
  ],
  instructor: { id: 5, firstName: 'Alice', lastName: 'Smith' },
};
const fields: (keyof SectionProfile)[] = ['section', 'year', 'semester', 'type'];
const labels: Record<keyof SectionProfile, string> = {
  section: 'Section',
  year: 'Year',
  semester: 'Semester',
  type: 'Type',
};

describe('createProfileDetails helper', () => {
  it('returns correct profile details array', () => {
    const details = createProfileDetails(dummySection, fields, labels);
    expect(details).toEqual([
      { label: 'Section', value: String(dummySection.sectionDetails?.section) },
      { label: 'Year', value: String(dummySection.sectionDetails?.year) },
      { label: 'Semester', value: String(dummySection.sectionDetails?.semester) },
      { label: 'Type', value: String(dummySection.sectionDetails?.type) },
    ]);
  });
});

describe('SectionProfileSection component', () => {
  const onSaveSchedule: Mock = vi.fn(async () => true);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile details and schedule list', () => {
    render(
      <MemoryRouter>
        <SectionProfileSection
          section={dummySection}
          profileFields={fields}
          fieldLabels={labels}
          isCoordinator={true}
          onSaveSchedule={onSaveSchedule}
        />
      </MemoryRouter>
    );

    // Header link
    expect(screen.getByRole('link', { name: /COSC 111 A — Intro to CS/ })).toBeInTheDocument();
    // Profile rows
    fields.forEach(key => {
      expect(screen.getByTestId(`profile-row-${labels[key]}`)).toBeInTheDocument();
    });
    // Instructor row
    expect(screen.getByTestId('profile-row-instructor')).toHaveTextContent('Alice Smith');
    // Schedule item
    const items = screen.getAllByRole('listitem');
    const scheduleItem = items.find(item => item.textContent?.includes('Mon'));
    expect(scheduleItem).toBeDefined();
    expect(scheduleItem).toHaveTextContent('08:00');
    expect(scheduleItem).toHaveTextContent('09:30');
    // Update Schedule button
    expect(screen.getByText('Update Schedule')).toBeInTheDocument();
    // Add Schedule button
    expect(screen.getByText('+ Add Schedule')).toBeInTheDocument();
  });

  it('reveals schedule editor when Update Schedule clicked', () => {
    render(
      <MemoryRouter>
        <SectionProfileSection
          section={dummySection}
          profileFields={fields}
          fieldLabels={labels}
          isCoordinator={true}
          onSaveSchedule={onSaveSchedule}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Update Schedule'));
    // EditSectionSchedule Save/Cancel exist
    expect(screen.getAllByText('Save').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
  });

  it('reveals schedule editor when + Add Schedule clicked', () => {
    render(
      <MemoryRouter>
        <SectionProfileSection
          section={dummySection}
          profileFields={fields}
          fieldLabels={labels}
          isCoordinator={true}
          onSaveSchedule={onSaveSchedule}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('+ Add Schedule'));
    expect(screen.getAllByText('Save').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
  });
});
