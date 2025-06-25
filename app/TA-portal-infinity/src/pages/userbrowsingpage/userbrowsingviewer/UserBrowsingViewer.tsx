import { Link, useNavigate } from "react-router-dom";
import SearchUserBar, { useUserSearch } from "../../../components/ui/searchuserbar/SearchUserBar";
import { useAuth } from "../../../context/AuthContext";
import type User from "../../../interfaces/user/User";
import { studentFieldLabels, studentProfileFields } from "../../../interfaces/user/Student";
import { instructorFieldLabels, instructorProfileFields } from "../../../interfaces/user/Instructor";
import formatDateForDisplay from "../../../utility/formatdatefordisplay/formatDateForDisplay";

export default function UserBrowsingViewer() {
    const { userRoles } = useAuth();
    const { searchedUsers = [], loading, error, search, deleteUser, lastCriteria } = useUserSearch();
    const navigate = useNavigate();

    // choose columns & labels based on selected role
    let columns: (keyof User | 'name')[] = [];
    let labels: Record<string, string> = {};
    if (lastCriteria.role === "Student") {
        columns = studentProfileFields.filter(f => f !== 'id' && f !== 'firstName' && f !== 'lastName') as (keyof User)[];
        columns.unshift('name');
        labels = { name: 'Name', ...studentFieldLabels };
        delete labels.id;
    } else if (lastCriteria.role === "Instructor") {
        columns = instructorProfileFields.filter(f => f !== 'id' && f !== 'firstName' && f !== 'lastName') as (keyof User)[];
        columns.unshift('name');
        labels = { name: 'Name', ...instructorFieldLabels };
        delete labels.id;
    } else {
        columns = ['name', 'email', 'createdAt'];
        labels = { name: 'Name', email: 'Email', createdAt: 'Registered' };
    }

    const handleDelete = (id?: number) => deleteUser(id);

    return (
        <div>
            <div className="flex justify-between items-end mb-4">
                <SearchUserBar onSearch={search} loading={loading} />
                {/* {userRoles.includes('COORDINATOR') && (
                    <button onClick={() => navigate('/users/new')} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
                        Add User
                    </button>
                )} */}
                {/* For development: */}
                <button onClick={() => navigate('/user/coordinator/browseuser/newuser')} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
                    Add User
                </button>

            </div>

            {error && <div className="text-red-500 mb-2">{error}</div>}

            {searchedUsers && searchedUsers.length > 0 ? (
                <table className="min-w-full border-collapse">
                    <thead><tr>
                        {columns.map(col => <th key={String(col)} className="border-b px-3 py-1 text-left bg-gray-100">{labels[col]}</th>)}
                        <th className="border-b px-3 py-1 text-left bg-gray-100">Actions</th>
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
                                    // wrap name in link for TA or Instructor
                                    if (col === 'name' && lastCriteria.role !== 'Coordinator' && user.id) {
                                        const path = lastCriteria.role === 'Student' ? `/user/taprofile/${user.id}` : `/user/instructorprofile/${user.id}`;
                                        return <td key={col as string} className="border-b px-3 py-1"><Link to={path} className="hover:underline text-blue-600">{display}</Link></td>;
                                    }
                                    return <td key={col as string} className="border-b px-3 py-1">{display}</td>;
                                })}
                                <td className="border-b px-3 py-1">
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : searchedUsers !== null ? (<div>No users found.</div>) : null}
        </div>
    );
}
