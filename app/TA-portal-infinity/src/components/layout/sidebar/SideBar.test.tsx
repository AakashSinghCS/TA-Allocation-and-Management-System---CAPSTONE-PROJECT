import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { UserRole } from '../../../interfaces/enum/UserRole';
import SideNav from './SideBar';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
    useLocation: vi.fn(),
  };
});

// Mock AuthContext
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('SideNav Component', () => {
  const logoutMock = vi.fn();

  beforeEach(() => {
    // Default location
    (useLocation as Mock).mockReturnValue({ pathname: '/user/profile/1' });

    // Default auth
    (useAuth as Mock).mockReturnValue({
      logout: logoutMock,
      userRoles: [UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.COORDINATOR],
      userId: 1,
    });
  });

  it('does not show labels when not hovered', () => {
    render(<SideNav />);
    // "Profile" label should be hidden initially
    expect(screen.queryByText('Profile')).toBeNull();
  });

  it('shows labels on hover', () => {
    const { container } = render(<SideNav />);
    const aside = container.querySelector('aside');
    expect(aside).toBeTruthy();
    // Hover to expand
    if (aside) fireEvent.mouseEnter(aside);
    // Now label should appear
    expect(screen.getByText('Profile')).toBeVisible();
  });

  it('only renders nav items for allowed roles', () => {
    // Given roles student, instructor, coordinator, but not admin
    render(<SideNav />);
    // Coordinator Dashboard should be present after hover
    const aside = document.querySelector('aside')!;
    fireEvent.mouseEnter(aside);
    expect(screen.getByText('Coordinator Dashboard')).toBeInTheDocument();
    // Deadline Management is admin-only
    expect(screen.queryByText('Deadline Management')).toBeNull();
  });

  it('calls logout when logout button is clicked', () => {
    const { container } = render(<SideNav />);
    // Expand to show button text
    const aside = container.querySelector('aside')!;
    fireEvent.mouseEnter(aside);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(logoutMock).toHaveBeenCalled();
  });
});
