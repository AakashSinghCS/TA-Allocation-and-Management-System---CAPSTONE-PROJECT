import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecentApplications from '../RecentApplications';
import type { ApplicationDto } from '../../../../interfaces/application/Application';
import type { Allocation } from '../../../../interfaces/allocation/Allocation';

describe('RecentApplications', () => {
  const recentApps: ApplicationDto[] = [
    {
      id: 1,
      student: { id: 1, firstName: 'John', lastName: 'Doe' },
      timeSubmitted: new Date().toISOString(),
      preferences: ['A', 'B'],
      applicationType: 'TA',
      wantWorkingHours: 10,
    } as any,
  ];
  const recentAppAllocations: Record<number, Allocation[]> = { 1: [] };
  const topAllocations: Allocation[] = [];

  it('renders recent applications', () => {
    render(
      <MemoryRouter>
        <RecentApplications
          recentApps={recentApps}
          recentAppAllocations={recentAppAllocations}
          topAllocations={topAllocations}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Recent Applications')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Preferences: A, B')).toBeInTheDocument();
    expect(screen.getByText('Type: TA')).toBeInTheDocument();
    expect(screen.getByText('Hours Requested: 10')).toBeInTheDocument();
  });

  it('shows message when no applications', () => {
    render(
      <MemoryRouter>
        <RecentApplications
          recentApps={[]}
          recentAppAllocations={{}}
          topAllocations={[]}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('No new applications.')).toBeInTheDocument();
  });
});
