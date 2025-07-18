import { generatePath, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import type User from "../../../../interfaces/user/User";
import { studentFieldLabels, studentProfileFields } from "../../../../interfaces/user/Student";
import { instructorFieldLabels, instructorProfileFields } from "../../../../interfaces/user/Instructor";
import formatDateForDisplay from "../../../../utility/formatdatefordisplay/formatDateForDisplay";
import SearchUserBar, { useUserSearch, type SearchCriteria } from "../../../../components/ui/user/searchuserbar/SearchUserBar";
import { UserRole } from "../../../../interfaces/enum/UserRole";

interface UserBrowsingViewerProps {
    mode?: 'view' | 'select';
    onSelect?: (u: User) => void;
    allowedRoles? : SearchCriteria['role'][];
    askForConfirmation? : boolean
}

export default function UserBrowsingViewer({
    mode = 'view',
    onSelect,
    allowedRoles,
    askForConfirmation = false
}: UserBrowsingViewerProps) {

    const { userRoles } = useAuth();
    const { searchedUsers = [], loading, error, search, toggleActivation, lastCriteria } = useUserSearch();
    const navigate = useNavigate();
    const isCoordinatorOrAdmin = userRoles.includes(UserRole.COORDINATOR || UserRole.ADMIN);
    // choose columns & labels based on selected role
    let columns: (keyof User | 'name')[] = [];
    let labels: Record<string, string> = {};
    if (lastCriteria.role === "Student") {
        columns = studentProfileFields.filter(f => isCoordinatorOrAdmin ? f !== 'firstName' && f !== 'lastName'
            : f !== 'firstName' && f !== 'lastName' && f !=='id'
        ) as (keyof User)[];
        columns.unshift('name');
        labels = { name: 'Name', ...studentFieldLabels };
        if(!isCoordinatorOrAdmin) delete labels.id;
    } else if (lastCriteria.role === "Instructor") {
        columns = instructorProfileFields.filter(f => isCoordinatorOrAdmin ? f !== 'firstName' && f !== 'lastName'
            : f !== 'firstName' && f !== 'lastName' && f !=='id'
        ) as (keyof User)[];
        columns.unshift('name');
        labels = { name: 'Name', ...instructorFieldLabels };
        if(!isCoordinatorOrAdmin) delete labels.id;
    } else {
        columns = ['name', "id",'email', 'createdAt'];
        labels = { name: 'Name', id: "ID", email: 'Email', createdAt: 'Registered' };
    }

    const handleToggleActivation = (id?: number, currentlyActive?: boolean) => {
        toggleActivation(id, currentlyActive);
    };


    const handleAskForConfirmation = (e: React.MouseEvent<HTMLAnchorElement>, uId:number) => {
    if (!askForConfirmation) {
        return; // This does nothing — but crucially, does NOT call e.preventDefault()
    }
    e.preventDefault(); // This only runs if confirmation is needed

    const ok = window.confirm('Would you really like to navigate away from this page? You will lose all changes.');
    if (ok) {
        navigate(`/user/profile/${uId}`);
    }
};

    return (
        <>
            <div className="flex justify-between items-stretch mb-4">
                <div className="flex-1">
                    <SearchUserBar onSearch={search} loading={loading} allowedRoles={allowedRoles} mode={mode}/>
                </div>
                {userRoles.includes('COORDINATOR') && mode=='view' && (
                    <button onClick={() => navigate('/user/coordinator/browseuser/newuser')} 
                    className="bg-[#00c89c] text-white px-4 py-1 rounded hover:bg-[#c7fcec] 
                        cursor-pointer hover:text-[#0089b2] transition-colors">
                        Add User
                    </button>
                )}
                {/* For development: */}
                {/* <button onClick={() => navigate('/user/coordinator/browseuser/newuser')} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
                    Add User
                </button> */}

            </div>

            {error && <div className="text-red-500 mb-2">{error}</div>}

            {searchedUsers && searchedUsers.length > 0 ? (
                <div className="overflow-x-auto w-full">
                <table className="min-w-full border-collapse">
                    <thead><tr>
                        {columns.map(col => <th key={String(col)} className="border border-gray-300 px-3 py-1 text-left bg-gray-100">{labels[col]}</th>)}
                        <th className="border border-gray-300 px-3 py-1 text-left bg-gray-100">Actions</th>
                    </tr></thead>
                    <tbody>
                        {searchedUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                {columns.map(col => {
                                    let raw = (user as any)[col];
                                    let display = raw;

                                    if (col === 'name') {
                                        display = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
                                    } else if (col === 'createdAt' && raw != null) {
                                        const d = typeof raw === 'string' ? new Date(raw) : raw;
                                        display = formatDateForDisplay(d);
                                    }
                                    if (col === 'name' && user.id) {
                                        return <td key={col as string} className="border border-gray-300 px-3 py-1">
                                            <Link to ={`/user/profile/${user.id}`} onClick={(e) => handleAskForConfirmation(e, user.id ?? -1)}
                                            className="text-[#0089b2] hover:text-[#00b5bc] truncate inline whitespace-nowrap overflow-hidden">
                                            {display}
                                            </Link>
                                        </td>;
                                    }
                                    return <td key={col as string} className="border border-gray-300 px-3 py-1">{display}</td>;
                                })}
                                <td className="border border-gray-300 px-3 py-1">
                                    {mode === 'select' ? (
                                        <button
                                            type="button"
                                            onClick={() => onSelect?.(user)}
                                            className="text-blue-600 hover:text-red-300"
                                        >
                                            Select
                                        </button>
                                    ) : (
                                            <button
                                                onClick={() => handleToggleActivation(user.id, user.active)}
                                                disabled={!userRoles.includes("ADMIN")}
                                                className={`px-3 py-1 rounded text-white text-sm font-medium transition-colors
                                                    ${!userRoles.includes("ADMIN")
                                                        ? "bg-gray-300 cursor-not-allowed"
                                                        : user.active
                                                            ? "bg-red-500 hover:bg-red-600"
                                                            : "bg-green-500 hover:bg-green-600"
                                                    }`}
                                            >
                                                {user.active ? "Deactivate" : "Activate"}
                                            </button>

                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            ) : searchedUsers !== null ? (<div>No users found.</div>) : null}
        </>
    );
}
