import { NavLink, useParams } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';

export default function StudentTabNav() {
    const isCoordinator = useAuth().userRoles.includes("COORDINATOR");
    const { studentId } = useParams<{ studentId: string }>();
    const base = `/user/taprofile/${studentId}`;

    const tabs = isCoordinator ? [
        { to: `${base}`, label: 'Profile' },
        { to: `${base}/application`, label: 'Application' },
        { to: `${base}/coursesTaken`, label: 'Courses Taken' },
        { to: `${base}/compare`, label: 'Compare' },
    ]:[
        { to: `${base}`, label: 'Profile' },
        { to: `${base}/application`, label: 'Application' },
        { to: `${base}/coursesTaken`, label: 'Courses Taken' },
    ];

    return (
        <nav className="sticky top-0 bg-white z-10 border-b border-slate-200">
            {studentId && (
                <ul className="flex space-x-4 px-4">
                    {tabs.map(({ to, label }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={to.endsWith(studentId)}            
                                className={({ isActive }) =>
                                    `px-3 py-2 font-medium ${isActive
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-slate-600 hover:text-slate-800'
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        </li>
                    ))}

                </ul>
            )}
        </nav>
    );
}
