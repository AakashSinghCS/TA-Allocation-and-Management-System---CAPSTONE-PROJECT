import { render, screen } from '@testing-library/react';
import ApplicationStats from '../ApplicationStats';

describe('ApplicationStats', () => {
  it('renders all stat cards with correct values', () => {
    render(
      <ApplicationStats
        totalApplications={10}
        appsWithOffer={5}
        appsWithConfirmed={3}
        appsWithOfferWaiting={2}
        filteredCount={4}
      />
    );
    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Offer Sent')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Allocation Completed')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Waiting on Allocation')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Filtered Applications')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
