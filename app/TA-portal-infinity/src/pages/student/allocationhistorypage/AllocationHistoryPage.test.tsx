import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import AllocationHistoryPage from './AllocationHistoryPage';
import { useAuth } from '../../../context/AuthContext';
import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';
import { useParams } from 'react-router-dom';

// Mock AuthContext
vi.mock('../../../context/AuthContext', () => ({
    useAuth:  vi.fn(),
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
        (useParams as Mock).mockReturnValue({ userId: '1' });
    });

    it('renders Allocation History header', () => {
        (useAuth as Mock).mockReturnValue({ userRoles: [] });
        render(<AllocationHistoryPage />);
        expect(screen.getByText('Allocation History')).toBeInTheDocument();
    });

    it('shows Add a section when user is a student', () => {
        (useAuth as Mock).mockReturnValue({ userRoles: ['STUDENT'] });
        render(<AllocationHistoryPage />);
        const addLink = screen.getByText('Add a section');
        expect(addLink).toBeInTheDocument();
        fireEvent.click(addLink);
        expect(addLink.closest('a')).toHaveAttribute('href', '/user/student/addallocation');
    });

    it('hides Add a section when user is not a student', () => {
        (useAuth as Mock).mockReturnValue({ userRoles: ['INSTRUCTOR'] });
        render(<AllocationHistoryPage />);
        expect(screen.queryByText('Add a section')).toBeNull();
    });
});