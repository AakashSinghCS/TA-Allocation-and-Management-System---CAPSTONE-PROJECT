import { render, screen } from '@testing-library/react';
import SummaryMetrics from '../SummaryMetrics';

describe('SummaryMetrics', () => {
  it('renders all metrics with correct values', () => {
    render(
      <SummaryMetrics
        totalApps={10}
        pendingApplications={3}
        offerCount={4}
        confirmedCount={2}
        rejectedCount={1}
        sectionsInSystem={5}
      />
    );
    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Offers Sent')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Offers Confirmed')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Offers Rejected')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Total Sections')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
