import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import AllocationHistoryPage from './AllocationHistoryPage';
import { useAuth } from '../../../context/AuthContext';
import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';
import { useParams } from 'react-router-dom';

// Mock AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock GenericAPIContainer to render nothing (we only care about header and link)
vi.mock('../../../utility/genericapicontainer/GenericAPIContainer', () => ({
  GenericAPIContainer: ({ render }: any) => null,
}));

// Mock react-router hooks
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

describe('AllocationHistoryPage', () => {
  beforeEach(() => {
    // always pretend the route param is userId = "1"
    (useParams as Mock).mockReturnValue({ userId: '1' });
  });

  it('renders Allocation History header', () => {
    // any user (matching or not) sees the header
    (useAuth as Mock).mockReturnValue({ userRoles: [], userId: 999 });
    render(<AllocationHistoryPage />);
    expect(screen.getByText('Allocation History')).toBeInTheDocument();
  });

  it('shows Add a section when viewing own page', () => {
    // userId from useAuth matches the route param (1)
    (useAuth as Mock).mockReturnValue({ userRoles: [], userId: 1 });
    render(<AllocationHistoryPage />);
    const addLink = screen.getByText('Add a section');
    expect(addLink).toBeInTheDocument();
    fireEvent.click(addLink);
    expect(addLink.closest('a')).toHaveAttribute('href', '/user/student/addallocation');
  });

  it('hides Add a section when viewing someone else’s page', () => {
    // userId from useAuth does NOT match the route param (1)
    (useAuth as Mock).mockReturnValue({ userRoles: [], userId: 2 });
    render(<AllocationHistoryPage />);
    expect(screen.queryByText('Add a section')).toBeNull();
  });
});
