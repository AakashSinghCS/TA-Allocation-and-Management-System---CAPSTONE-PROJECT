// src/pages/userBrowsing/UserBrowsingPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAllSearchedUsers } from "../../api/user/fetchAllSearchedUsers";
import formatDateForDisplay from "../../utility/formatdatefordisplay/formatDateForDisplay";
import type User from "../../interfaces/user/User";
import { studentFieldLabels, type Student, studentProfileFields } from "../../interfaces/user/Student";
import { instructorFieldLabels, type Instructor, instructorProfileFields } from "../../interfaces/user/Instructor";
import { useAuth } from "../../context/AuthContext";

export default function UserBrowsingPage() {
    return (
        <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Search for User</h3>
            <UserBrowsingViewer />
        </div>
    );
}

function UserBrowsingViewer() {
    const { userRoles } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState<"Student" | "Instructor" | "Coordinator">("Student");
    const [name, setName] = useState<string>("");
    const [universityNumber, setUniversityNumber] = useState<string>("");
    const [searchedUsers, setSearchedUsers] = useState<User[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError(null);
        const uniNum = parseInt(universityNumber, 10) || 0;
        try {
            const req = { role, name, universityNumber: uniNum };
            let users: User[] | null;
            if (role === "Student") users = await fetchAllSearchedUsers<Student>(req);
            else if (role === "Instructor") users = await fetchAllSearchedUsers<Instructor>(req);
            else users = await fetchAllSearchedUsers<User>(req);
            setSearchedUsers(users ?? []);
        } catch {
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        // await deleteMockUser(id);
        setSearchedUsers(prev => prev?.filter(u => u.id !== id) ?? []);
    };

    // choose columns & labels based on selected role
    let columns: (keyof User | 'name')[] = [];
    let labels: Record<string, string> = {};
    if (role === "Student") {
        // replace firstName/lastName with combined 'name'
        columns = studentProfileFields.filter(f => f !== 'id' &&f !== 'firstName' && f !== 'lastName') as (keyof User)[];
        columns.unshift('name');
        labels = { name: 'Name', ...studentFieldLabels };
        delete labels.id;
    } else if (role === "Instructor") {
        columns = instructorProfileFields.filter(f => f !== 'id' && f !== 'firstName' && f !== 'lastName') as (keyof User)[];
        columns.unshift('name');
        labels = { name: 'Name', ...instructorFieldLabels };
        delete labels.id;
    } else {
        // coordinator: only base User fields
        columns = ['name', 'email', 'createdAt'];
        labels = { name: 'Name', email: 'Email', createdAt: 'Registered' };
    }

    return (
        <div>
            <div className="flex justify-between items-end mb-4">
                <form className="flex space-x-2" onSubmit={onSubmit}>
                    <select value={role} onChange={e => setRole(e.target.value as any)} className="border px-2 py-1 rounded">
                        <option value="Student">Student</option>
                        <option value="Instructor">Instructor</option>
                        <option value="Coordinator">Coordinator</option>
                    </select>
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border px-2 py-1 rounded" />
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        placeholder="University Number"
                        value={universityNumber}
                        onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 8) setUniversityNumber(val);
                        }}
                        className="border px-2 py-1 rounded w-40"
                    />
                    <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:opacity-50">
                        {loading ? 'Searching…' : 'Search'}
                    </button>
                </form>
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
                                    if (col === 'name' && role !== 'Coordinator' && user.id) {
                                        const path = role === 'Student' ? `/user/taprofile/${user.id}` : `/user/instructorprofile/${user.id}`;
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
