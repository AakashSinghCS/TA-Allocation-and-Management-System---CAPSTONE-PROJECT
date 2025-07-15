import { NavLink, useParams } from 'react-router-dom';
import { UserRole } from '../../../interfaces/enum/UserRole';
import type { FC } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface Tab { to: string; label: string; }
interface TabNavProps {
  roles: UserRole[];
}

const TabNav: FC<TabNavProps> = ({ roles }) => {
const isCoordinator = useAuth().userRoles.includes("COORDINATOR");
  const { userId } = useParams<{ userId: string }>();
  if (!userId) return null;

  const tabs: Tab[] = [];

  if (roles.includes(UserRole.STUDENT) && isCoordinator) {
    const base = `/user/taprofile/${userId}`;
    tabs.push(
      { to: `/user/profile/${userId}`, label: 'Profile' },
      { to: `${base}/qualifications`, label: 'Student Lab Skills' },
      { to: `${base}/allocationHistory`, label: 'Allocation History' },
      { to: `${base}/profileQuestions`, label: 'Profile Questions' }
    );
  }

  if (roles.includes(UserRole.INSTRUCTOR) && isCoordinator) {
    const base = `/user/instructorprofile/${userId}`;
    tabs.push(
      { to: `/user/profile/${userId}`, label: 'Profile' },
      { to: `${base}/need`, label: 'Need' },
      { to: `${base}/qualifications`, label: 'Instructor Lab Skills' }
    );
  }

  // if user has both roles, tabs will include duplicates; remove duplicates
  const uniqueTabs = Array.from(
    new Map(tabs.map(tab => [tab.to, tab])).values()
  );

  return (
    <>
       {isCoordinator&& <nav className="sticky top-0 bg-white z-10 border-b border-slate-200 mb-3">
            <ul className="flex space-x-4 px-4">
            {uniqueTabs.map(({ to, label }) => (
                <li key={to}>
                <NavLink
                    to={to}
                    end
                    className={({ isActive }) =>
                    `px-3 py-2 font-medium ${
                        isActive
                        ? 'border-b-2 border-[#040941] text-[#0089b2]'
                        : 'text-slate-600 hover:text-slate-800'
                    }`
                    }
                >
                    {label}
                </NavLink>
                </li>
            ))}
            </ul>
        </nav>
        }
    </>
  );
};

export default TabNav;
