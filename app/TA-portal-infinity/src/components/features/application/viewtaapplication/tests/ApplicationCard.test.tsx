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
    id: 10,
    application: { applicationId: 1 },
    status: 'REJECTED',
    labPrepHours: 0,
    gradingHours: 0,
    sectionHours: 8,
    allocatedSections: [
      { id: 1, allocationId: 10, sectionId: 5, task: 'LAB', hours: 8 }
    ],
    sections: [
      {
        id: 5,
        course: { deptCode: 'COSC', courseNum: '121', name: 'Test' },
        section: '001',
        type: 'TUTORIAL',
        semester: 'S',
        year: 2024,
        instructor: { firstName: 'Bob', lastName: 'Brown' },
      }
    ],
  } as any,
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
