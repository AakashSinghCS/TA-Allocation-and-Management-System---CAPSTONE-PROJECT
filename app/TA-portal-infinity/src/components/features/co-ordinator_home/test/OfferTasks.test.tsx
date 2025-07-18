import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OfferTasks from '../OfferTasks';
import type { Allocation } from '../../../../interfaces/allocation/Allocation';

describe('OfferTasks', () => {
  const topAllocations: Allocation[] = [
    {
      id: 1,
      student: { id: 1, firstName: 'Jane', lastName: 'Smith', email: 'jane@uni.ca' },
      numberOfHours: 20,
      status: 'SENT',
      section: { year: 2025, semester: 'W', type: 'LEC', course: { deptCode: 'COSC', courseNum: '499', name: 'Capstone' } },
    } as any,
  ];

  it('renders offer tasks', () => {
    render(
      <MemoryRouter>
        <OfferTasks topAllocations={topAllocations} />
      </MemoryRouter>
    );
    expect(screen.getByText('Offer Tasks')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    const hoursAllocated = screen.getAllByText((_, node) =>
      !!node && node.textContent !== null && node.textContent.replace(/\s+/g, ' ').includes('Hours Allocated: 20')
    );
    expect(hoursAllocated.length).toBeGreaterThan(0);
    const offerSent = screen.getAllByText((_, node) =>
      !!node && node.textContent !== null && node.textContent.replace(/\s+/g, ' ').includes('Offer Sent')
    );
    expect(offerSent.length).toBeGreaterThan(0);
    const sectionText = screen.getAllByText((_, node) =>
      !!node && node.textContent !== null && node.textContent.replace(/\s+/g, ' ').includes('Section: 2025 W, LEC — COSC 499 (Capstone)')
    );
    expect(sectionText.length).toBeGreaterThan(0);
  });
 
  it('shows message when no allocations', () => {
    render(
      <MemoryRouter>
        <OfferTasks topAllocations={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText('No recent allocations.')).toBeInTheDocument();
  });
});
