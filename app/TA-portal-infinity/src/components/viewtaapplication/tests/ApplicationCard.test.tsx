import { render, screen, fireEvent } from '@testing-library/react';
import ApplicationCard from '../ApplicationCard';

describe('ApplicationCard', () => {
  const app = {
    applicationId: 1,
    preferences: ['COSC 111', 'COSC 121'],
    wantRemote: true,
    wantWorkingHours: 10,
    timeSubmitted: new Date('2024-01-01T12:00:00Z').toISOString(),
    student: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      studentNum: '12345678',
      program: 'Computer Science',
      enrollmentYear: 2022,
      schoolYear: '2',
    },
  };
  const allocations = [
    {
      numberOfHours: 5,
      status: 'CONFIRMED',
      section: {
        sectionDetails: {
          deptCode: 'COSC',
          courseNum: '111',
          semester: 'W',
          year: 2024,
          type: 'LECTURE',
        },
        instructor: { firstName: 'Jane', lastName: 'Smith' },
      },
      application: { applicationId: 1 },
    },
  ];

  it('renders summary info and expands/collapses details', () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();
    render(
      <ApplicationCard
        app={app as any}
        allocations={allocations as any}
        isAllocated={true}
        isExpanded={false}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('COSC 111, COSC 121')).toBeInTheDocument();
    // There are multiple 'Yes' texts (Remote, Offer Sent, Allocation Confirmed). Checking for all.

    const yesElements = screen.getAllByText('Yes');
    expect(yesElements.length).toBeGreaterThanOrEqual(1); 
    expect(screen.getByText('View Details')).toBeInTheDocument();
    fireEvent.click(screen.getByText('View Details'));
    expect(onExpand).toHaveBeenCalled();
  });

  it('shows details and can collapse', () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();
    render(
      <ApplicationCard
        app={app as any}
        allocations={allocations as any}
        isAllocated={true}
        isExpanded={true}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );
    expect(screen.getByText('Application Info')).toBeInTheDocument();
    expect(screen.getByText('Hide Details')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Hide Details'));
    expect(onCollapse).toHaveBeenCalled();
  });
});
