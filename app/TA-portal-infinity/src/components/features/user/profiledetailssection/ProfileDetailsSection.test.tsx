import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProfileDetailsSection from './ProfileDetailsSection';
import { useAuth } from '../../../../context/AuthContext';
import type User from '../../../../interfaces/user/User';

vi.mock('../../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../../components/features/user/editprofilesection/EditProfileSection', () => ({
    default: () => <div data-testid="edit-section">EDIT MODE</div>,
}));

describe('ProfileDetailsSection', () => {
    const mockFetchDetails = vi.fn();
    const baseUser: User = {
        id: 1,
        firstName: 'Alice',
        lastName: 'Smith',
        createdAt: '2025-06-24T15:12:01.428504',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    function setupAuth(userId: number, userRoles: string[]) {
        // @ts-ignore
        (useAuth as vi.Mock).mockReturnValue({ userId, userRoles });
    }

    it('hides the Update button when not owner or coordinator', () => {
        setupAuth(2, ['STUDENT']);
        render(
            <ProfileDetailsSection
                user={baseUser}
                fields={['firstName', 'lastName', 'createdAt']}
                labels={{
                    id: "id",
                    email: "Email",
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    createdAt: 'Created At',
                }}
                fetchDetailsFunction={mockFetchDetails}
            />
        );
        expect(screen.queryByText('Update')).toBeNull();
    });

    it('shows the Update button for the owner', () => {
        setupAuth(1, ['STUDENT']);
        render(
            <ProfileDetailsSection
                user={baseUser}
                fields={['firstName', 'lastName']}
                labels={{
                    id: "1",
                    email: "test@test.com",
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    createdAt: 'Created At',
                }}
                fetchDetailsFunction={mockFetchDetails}
            />
        );
        expect(screen.getByText('Update')).toBeInTheDocument();
    });

    it('shows the Update button for a coordinator', () => {
        setupAuth(42, ['COORDINATOR']);
        render(
            <ProfileDetailsSection
                user={baseUser}
                fields={['firstName', 'lastName']}
                labels={{
                    id: "1",
                    email: "test@test.com",
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    createdAt: 'Created At',
                }}
                fetchDetailsFunction={mockFetchDetails}
            />
        );
        expect(screen.getByText('Update')).toBeInTheDocument();
    });

    it('enters edit mode when Update is clicked', () => {
        setupAuth(1, ['USER']);
        render(
            <ProfileDetailsSection
                user={baseUser}
                fields={['firstName', 'lastName']}
                labels={{
                    id: "1",
                    email: "test@test.com",
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    createdAt: 'Created At',
                }}
                fetchDetailsFunction={mockFetchDetails}
            />
        );

        fireEvent.click(screen.getByText('Update'));
        expect(screen.getByTestId('edit-section')).toBeInTheDocument();
    });
});
