import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

import Comparer from './Comparer';
import { mockSectionCOSC111 as s111 } from '../../../../../mocked-objects/section/mockSectionCOSC111';
import { mockSectionCOSC121 as s121 } from '../../../../../mocked-objects/section/mockSectionCOSC121';

vi.mock('../../../../../utility/genericapicontainer/GenericAPIContainer', () => {
  return {
    GenericAPIContainer: (props: any) => props.render([s111, s121]),
  };
});

const arbitaryId = 10;

const renderComparer = () =>
  render(
    <MemoryRouter>
      <Comparer studentId={arbitaryId} />
    </MemoryRouter>
  );

describe('<Comparer />', () => {
  it('shows “No courses…” before a search, then lists COSC 111 & COSC 121 after clicking Search', () => {
    renderComparer();

    expect(screen.getByText(/no courses to display/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    const headings = screen.getAllByText(/cosc\s*111/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cosc\s*121/i).length).toBeGreaterThan(0);

  });

  it('clicking compare needs button makes highlight work', async () => {
    renderComparer();

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    //Change values here when the buttons are updated.
    const compareBtn = screen.getByRole('button', { name: /compare needs/i });
    const exactBtn = screen.getByRole('button', { name: /find exact match/i });

    expect(compareBtn).toBeDisabled();
    expect(exactBtn).toBeDisabled();

    const cosc121 = screen.getAllByText(/cosc\s*121/i);
    fireEvent.click(cosc121[0]);

    expect(compareBtn).toBeEnabled();
    fireEvent.click(compareBtn);


    await waitFor(() => {
      const highlighted = screen
        .getAllByTestId(/^section-card-/)      // grab every card
        .find(card => card.className.includes('outline-green-400'));
      expect(highlighted).toBeTruthy();        // will be the COSC 111 card
    });

    const cosc111 = screen.getAllByText(/cosc\s*111/i);
    fireEvent.click(cosc111[0]);
    expect(exactBtn).toBeEnabled();
    fireEvent.click(exactBtn);

    await waitFor(() => {
      const highlighted = screen
        .getAllByTestId(/^section-card-/)      // grab every card
        .find(card => card.className.includes('outline-blue-400'));
      expect(highlighted).toBeTruthy();        // will be the COSC 111 card
    });
  });
});
