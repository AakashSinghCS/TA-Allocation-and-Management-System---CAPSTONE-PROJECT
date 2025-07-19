import { generatePath, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import type User from "../../../../interfaces/user/User";
import { studentFieldLabels, studentProfileFields } from "../../../../interfaces/user/Student";
import { instructorFieldLabels, instructorProfileFields } from "../../../../interfaces/user/Instructor";
import formatDateForDisplay from "../../../../utility/formatdatefordisplay/formatDateForDisplay";
import SearchUserBar, { type SearchCriteria } from "../../../../components/ui/user/searchuserbar/SearchUserBar";
import { UserRole } from "../../../../interfaces/enum/UserRole";
import { useState } from "react";
import Pagination from "../../../admin/audit/pagination/Pagination";
import { useUserSearchPage, useUserSuggestions } from "../../../../api/user/search/useUserSearch";
import { useDebounce } from "../../../../utility/pagination/useDebounce";
import { fetchActivate, fetchDeactivate } from "../../../../api/admin/fetchActivation";
import React from "react";

interface UserBrowsingViewerProps {
    mode?: 'view' | 'select';
    onSelect?: (u: User) => void;
    allowedRoles?: SearchCriteria['role'][];
    askForConfirmation?: boolean
}

export default function UserBrowsingViewer({
    mode = 'view',
    onSelect,
    allowedRoles,
    askForConfirmation = false
}: UserBrowsingViewerProps) {
    const navigate = useNavigate();
    const { userRoles } = useAuth();

    const [rawCriteria, setRawCriteria] = useState<SearchCriteria>({
        role: allowedRoles?allowedRoles[0]:"", firstname: '', lastname: '',
        universityNumber: '', userId: '',
    });
    const criteria = useDebounce(rawCriteria, 300);

    // const [criteria, setCriteria] = useState<SearchCriteria>({ role: '', firstname: '', lastname: ''});
    const [showAll, setShowAll] = useState(false);
    const [page, setPage] = useState(0);

    const suggQ = useUserSuggestions(criteria);
    const fullQ = useUserSearchPage(criteria, page, 10);
React.useEffect(() => {
     console.log('Full page data:', suggQ.data);
  if (fullQ.data) {
    console.log('Full page data:', fullQ.data);
  }
}, [fullQ.data,suggQ.data]);
    const hasAnyFilter = Boolean(
        rawCriteria.userId
        || rawCriteria.universityNumber
        || (rawCriteria.role)
    );

    const results = showAll
        ? fullQ.data?.content ?? []
        : suggQ.data?.content ?? [];

    const displayRows = hasAnyFilter ? results : [];
    const loading = showAll ? fullQ.isFetching : suggQ.isFetching;
    const errorMsg = showAll ? fullQ.error : suggQ.error;

    // const { searchedUsers = [], loading, error, search, toggleActivation, lastCriteria } = useUserSearch();
    const handleToggleActivation = async (id: number, active: boolean) => {
        const ok = window.confirm(`Are you sure you want to ${active ? 'deactivate' : 'activate'} this user?`);
        if (!ok) return;

        const success = active ? await fetchDeactivate(id) : await fetchActivate(id);
        if (success) {
            // invalidate both queries so UI refreshes
            suggQ.refetch();
            fullQ.refetch();
        } else {
            alert(`Failed to ${active ? 'deactivate' : 'activate'} user`);
        }
    };

    const isAdminOrCoord = userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.COORDINATOR);
    // choose columns & labels based on selected role
    let columns: (keyof User | 'name')[] = [];
    let labels: Record<string, string> = {};
    if (rawCriteria.role === "Student") {
        columns = studentProfileFields.filter(f => isAdminOrCoord ? f !== 'firstName' && f !== 'lastName'
            : f !== 'firstName' && f !== 'lastName' && f !== 'id'
        ) as (keyof User)[];
        columns.unshift('name');
        labels = { name: 'Name', ...studentFieldLabels };
        if (!isAdminOrCoord) delete labels.id;
    } else if (rawCriteria.role === "Instructor") {
        columns = instructorProfileFields.filter(f => isAdminOrCoord ? f !== 'firstName' && f !== 'lastName'
            : f !== 'firstName' && f !== 'lastName' && f !== 'id'
        ) as (keyof User)[];
        columns.unshift('name');
        labels = { name: 'Name', ...instructorFieldLabels };
        if (!isAdminOrCoord) delete labels.id;
    } else {
        columns = ['name', "id", 'email', 'createdAt'];
        labels = { name: 'Name', id: "ID", email: 'Email', createdAt: 'Registered' };
    }

    // const handleToggleActivation = (id?: number, currentlyActive?: boolean) => {
    //     toggleActivation(id, currentlyActive);
    // };


    const handleNavConfirm = (e: React.MouseEvent, uId: number) => {
        if (!askForConfirmation) return;
        e.preventDefault();
        if (window.confirm('Navigate away? You’ll lose changes.')) {
            navigate(`/user/profile/${uId}`);
        }
    };
    return (
        <>
            <div className="flex justify-between items-stretch mb-4">
                <div className="flex-1">
                    {/* <SearchUserBar onSearch={search} loading={loading} allowedRoles={allowedRoles} mode={mode}/> */}
                    <SearchUserBar
                        criteria={rawCriteria}
                        setCriteria={c => { setRawCriteria(c); setShowAll(false); setPage(0); }}
                        loading={loading}
                        allowedRoles={allowedRoles}
                        mode={mode}
                    />
                </div>
                {userRoles.includes('COORDINATOR') && mode == 'view' && (
                    <button onClick={() => navigate('/user/coordinator/browseuser/newuser')}
                        className="bg-[#00c89c] text-white px-4 py-1 rounded hover:bg-[#c7fcec] 
                        cursor-pointer hover:text-[#0089b2] transition-colors">
                        Add User
                    </button>
                )}

            </div>

            {errorMsg && (
                <div className="text-red-500 mb-2">
                    {(errorMsg as Error).message}
                </div>
            )}

            <div className="overflow-x-auto w-full">

                {!hasAnyFilter &&<>
                <p className="text-gray-500">
                    Please select a role (and/or enter a Student/Employee number or User ID) to begin.
                </p></> }

                {hasAnyFilter && <table className="min-w-full border-collapse">
                    <thead><tr>
                        {columns.map(col => <th key={String(col)} className="border border-gray-300 px-3 py-1 bg-gray-100">{labels[col]}</th>)}
                        <th className="border border-gray-300 px-3 py-1 bg-gray-100">Actions</th>
                    </tr></thead>
                    <tbody>

                        {displayRows.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                {columns.map(col => {
                                    let disp: any = (user as any)[col];
                                    if (col === 'name') disp = `${user.firstName} ${user.lastName}`.trim();
                                    if (col === 'createdAt' && disp) disp = formatDateForDisplay(new Date(disp));
                                    if (col === 'name') {
                                        return (
                                            <td key={col} className="border border-gray-300 px-3 py-1">
                                                <Link
                                                    to={`/user/profile/${user.id}`}
                                                    onClick={e => handleNavConfirm(e, user.id!)}
                                                    className="text-[#0089b2] hover:text-[#00b5bc] truncate"
                                                >
                                                    {disp}
                                                </Link>
                                            </td>
                                        );
                                    }
                                    return <td key={col} className="border border-gray-300 px-3 py-1">{disp}</td>;
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
                                            onClick={() => handleToggleActivation(user.id!, user.active!)}
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
                </table>}
            </div>

            {!showAll && (suggQ.data?.totalElements ?? 0) > 5 && (
                <button
                    onClick={() => setShowAll(true)}
                    className="mt-2 text-blue-600"
                >
                    Show All ({suggQ.data!.totalElements})
                </button>
            )}
            {showAll && (
                <Pagination
                    page={page}
                    pageCount={fullQ.data?.totalPages ?? 0}
                    onPrev={() => setPage(p => Math.max(0, p - 1))}
                    onNext={() => setPage(p => Math.min((fullQ.data?.totalPages ?? 1) - 1, p + 1))}
                />
            )}
        </>
    );
}
