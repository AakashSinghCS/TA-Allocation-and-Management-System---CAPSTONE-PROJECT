import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import ProfilePage from './ProfilePage';
import { useParams } from 'react-router-dom';

// Mock react-router hooks
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    Link: ({ children }: any) => <>{children}\</>,
}));

// Mock GenericAPIContainer to immediately render the ProfileDetailsSection
vi.mock('../../../utility/genericapicontainer/GenericAPIContainer', () => ({
    GenericAPIContainer: ({ render }: any) => render({ id: 1, roles: ['STUDENT'] }),
}));

// Mock ProfileDetailsSection to display a placeholder
vi.mock('../../../components/features/user/profiledetailssection/ProfileDetailsSection', () => ({
    _esModule: true,
    default: ({ user }: any) => <div>ProfileDetailsSection for user {user.id}</div>,
}));

describe('ProfilePage', () => {
    beforeEach(() => {
        (useParams as Mock).mockReturnValue({ userId: '1' });
    });

    it('renders ProfileDetailsSection with fetched user id', () => {
        render(<ProfilePage />);
        expect(screen.getByText('ProfileDetailsSection for user 1')).toBeInTheDocument();
    });
});
