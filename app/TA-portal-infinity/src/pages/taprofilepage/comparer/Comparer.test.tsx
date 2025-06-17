import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

import Comparer from './Comparer';
import { mockSectionCOSC111 as s111 } from '../../../mocked-objects/mockSectionCOSC111';
import { mockSectionCOSC121 as s121 } from '../../../mocked-objects/mockSectionCOSC121';

vi.mock('../../../utility/genericapicontainer/GenericAPIContainer', () => {
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

    expect(
      screen.getByText(/no courses to display/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    const headings = screen.getAllByText(/cosc\s*111/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cosc\s*121/i).length).toBeGreaterThan(0);

    fireEvent.click(headings[0]);
  });

  it('enables “Compare Needs” and “Exact Match” once the user selects a section card', () => {
    renderComparer();

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    //Change values here when the buttons are updated.
    const compareBtn = screen.getByRole('button', { name: /compare needs/i });
    const exactBtn   = screen.getByRole('button', { name: /exact match/i });

    expect(compareBtn).toBeDisabled();
    expect(exactBtn).toBeDisabled();

    const headings = screen.getAllByText(/cosc\s*111/i);
    fireEvent.click(headings[0]);

    expect(compareBtn).toBeEnabled();
    expect(exactBtn).toBeEnabled();
  });
});
