import { NavLink, useParams } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';

export default function InstructorTabNav() {
    const isCoordinator = useAuth().userRoles.includes("COORDINATOR");
    const { instructorId } = useParams<{ instructorId: string }>();
    const base = `/user/instructorprofile/${instructorId}`;

    const tabs = isCoordinator? [
        { to: `${base}`, label: 'Profile' },
        { to: `${base}/need`, label: 'Need' },
        { to: `${base}/compare`, label: 'Compare' },
    ]:[
        { to: `${base}`, label: 'Profile' },
        { to: `${base}/need`, label: 'Need' },
    ];

    return (
        <nav className="sticky top-0 bg-white z-10 border-b border-slate-200">
            {instructorId && (
                <ul className="flex space-x-4 px-4">
                    {tabs.map(({ to, label }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={to.endsWith(instructorId)}            
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
