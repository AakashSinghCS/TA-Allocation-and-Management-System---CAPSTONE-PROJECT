import { render, screen } from '@testing-library/react';
import { DeadlineTracker } from './DeadlineTracker';

describe('DeadlineTracker', () => {
  it('renders deadline tracker card', () => {
    render(
      <DeadlineTracker
        deadlines={[]}
        totalDeadlines={1}
      />
    );
    expect(screen.getByText(/Deadline\(s\)/)).toBeInTheDocument();
  });
});
