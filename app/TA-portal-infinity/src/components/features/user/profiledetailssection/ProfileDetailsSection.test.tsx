import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProfileDetailsSection from './ProfileDetailsSection';
import { useAuth } from '../../../../context/AuthContext';
import type User from '../../../../interfaces/user/User';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../editprofilesection/EditProfileSection', () => ({
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

    it('shows the Update button for the owner', () => {
        setupAuth(1, ['STUDENT']);
        render(
            <ProfileDetailsSection
                user={baseUser}
                fields={['firstName', 'lastName']}
                labels={{
                    id: "id",
                    email: "Email",
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    createdAt: 'Created At',
                    roles: 'Roles'
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
                    roles: "roles"
                }}
                fetchDetailsFunction={mockFetchDetails}
            />
        );

        fireEvent.click(screen.getByText('Update'));
        expect(screen.getByTestId('edit-section')).toBeInTheDocument();
    });

    vi.mock('../changerolemodal/ChangeRolesModal', () => ({
        default: (props: any) => (
            <div data-testid="change-roles-modal">
                <button onClick={() => props.onSave(["INSTRUCTOR"])}>Mock Save</button>
                <button onClick={props.onClose}>Mock Cancel</button>
            </div>
        ),
    }));

    it('shows Change Roles button for admin', () => {
        setupAuth(999, ['ADMIN']);
        render(
            <ProfileDetailsSection
                user={{ ...baseUser, roles: ['STUDENT'] }}
                fields={['firstName', 'lastName']}
                labels={{
                    id: "ID",
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    email: 'Test@test.com',
                    createdAt: 'Created At',
                    roles: 'Roles',
                }}
                fetchDetailsFunction={mockFetchDetails}
            />
        );
        expect(screen.getByText('Change Roles')).toBeInTheDocument();
    });

    it('does not show Change Roles button for non-admin', () => {
        setupAuth(999, ['COORDINATOR']);
        render(
            <ProfileDetailsSection
                user={{ ...baseUser, roles: ['STUDENT'] }}
                fields={['firstName', 'lastName']}
                labels={{
                    id: "ID",
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    email: 'test@test.com',
                    createdAt: 'Created At',
                    roles: 'Roles',
                }}
                fetchDetailsFunction={mockFetchDetails}
            />
        );
        expect(screen.queryByText('Change Roles')).not.toBeInTheDocument();
    });

    it('opens Change Roles modal when button is clicked', () => {
        setupAuth(999, ['ADMIN']);
        render(
            <ProfileDetailsSection
                user={{ ...baseUser, roles: ['STUDENT'] }}
                fields={['firstName', 'lastName']}
                labels={{
                    id: "ID",
                    firstName: 'First Name',
                    lastName: 'Last Name',
                    email: 'test@test.com',
                    createdAt: 'Created At',
                    roles: 'Roles',
                }}
                fetchDetailsFunction={mockFetchDetails}
            />
        );

        fireEvent.click(screen.getByText('Change Roles'));
        expect(screen.getByTestId('change-roles-modal')).toBeInTheDocument();
    });

});
