import { render, screen, fireEvent } from '@testing-library/react';
import ApplicationDetailsPanel from '../ApplicationDetailsPanel';
import type { EnrichedAllocatedSection } from '../../../../../pages/coordinator/applicationviewpage/ApplicationViewPage';

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
  const allocations: EnrichedAllocatedSection[] = [
  {
    // these two come from your AllocatedSection
    id:            1,
    sectionId:     5,
    allocationId: 10,
    task:         "LAB",
    hours:         8,

    // these come from your “enrichment”
    applicationId: 1,
    status:      "REJECTED",
    section: {
      id:        5,
      course:   { deptCode: "COSC", courseNum: "121", name: "Test" },
      section:  "001",
      type:     "TUTORIAL",
      semester: "S",
      year:     2024,
      instructor: { firstName: "Bob", lastName: "Brown" }
    }
  }
];
  const allocationHistory = allocations;

  it('renders details and allocations', () => {
    const onClose = vi.fn();
    render(
      <ApplicationDetailsPanel
        selectedApp={selectedApp as any}
        allocations={allocations}
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
        onClose={onClose}
      />
    );
    expect(screen.getByText('No allocations for this application.')).toBeInTheDocument();
  });
});
