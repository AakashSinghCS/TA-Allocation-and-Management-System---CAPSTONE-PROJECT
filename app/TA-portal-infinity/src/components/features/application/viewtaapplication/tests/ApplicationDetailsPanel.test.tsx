import { render, screen, fireEvent } from '@testing-library/react';
import ApplicationDetailsPanel from '../ApplicationDetailsPanel';

describe('ApplicationDetailsPanel', () => {
  const selectedApp = {
    applicationId: 1,
    preferences: ['COSC 111', 'COSC 121'],
    wantRemote: false,
    wantWorkingHours: 8,
    timeSubmitted: new Date('2024-01-01T12:00:00Z').toISOString(),
    student: {
      id: 1,
      firstName: 'Alice',
      lastName: 'Smith',
      studentNum: '87654321',
      program: 'Math',
      enrollmentYear: 2021,
      schoolYear: '3',
    },
  };
  const allocations = [
    {
      numberOfHours: 8,
      status: 'REJECTED',
      section: {
      
        semester: 'S',
        year: 2024,
        type: 'TUTORIAL',
        course:{
          deptCode: 'COSC',
          courseNum: '121',
        },
        instructor: { firstName: 'Bob', lastName: 'Brown' },
      },
      application: { applicationId: 1 },
    },
  ];
  const allocationHistory = allocations;

  it('renders details and allocations', () => {
    const onClose = vi.fn();
    render(
      <ApplicationDetailsPanel
        selectedApp={selectedApp as any}
        allocations={allocations as any}
        allocationHistory={allocationHistory as any}
        onClose={onClose}
      />
    );
    expect(screen.getByText('Application Details')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('COSC 111, COSC 121')).toBeInTheDocument();
    // There are multiple 'No' texts (Remote Preference, Confirmed)
    const noElements = screen.getAllByText('No');
    expect(noElements.length).toBeGreaterThanOrEqual(1); 

    expect(screen.getByText('Allocations')).toBeInTheDocument();
    // There may be multiple matches, so use getAllByText and check at least one contains 'TUTORIAL'
    const tutorialNodes = screen.getAllByText((_, node) => {
      return !!node && typeof node.textContent === 'string' && node.textContent.includes('TUTORIAL');
    });
    expect(tutorialNodes.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows no allocations message if none', () => {
    const onClose = vi.fn();
    render(
      <ApplicationDetailsPanel
        selectedApp={selectedApp as any}
        allocations={[]} 
        allocationHistory={[]} 
        onClose={onClose}
      />
    );
    expect(screen.getByText('No allocations for this application.')).toBeInTheDocument();
  });
});
