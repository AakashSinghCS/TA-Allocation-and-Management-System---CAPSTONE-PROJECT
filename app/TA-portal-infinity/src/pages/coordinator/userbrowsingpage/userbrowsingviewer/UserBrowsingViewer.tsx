import { generatePath, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import type User from "../../../../interfaces/user/User";
import { studentFieldLabels, studentProfileFields } from "../../../../interfaces/user/Student";
import { instructorFieldLabels, instructorProfileFields } from "../../../../interfaces/user/Instructor";
import formatDateForDisplay from "../../../../utility/formatdatefordisplay/formatDateForDisplay";
import SearchUserBar, { type SearchCriteria } from "../../../../components/ui/user/searchuserbar/SearchUserBar";
import { useCallback, useEffect, useState } from "react";
import Pagination from "../../../../utility/pagination/pagination/Pagination";
import { useUserSearchPage } from "../../../../api/user/search/useUserSearch";
import { useDebounce } from "../../../../utility/pagination/useDebounce";
import { fetchActivate, fetchDeactivate } from "../../../../api/admin/fetchActivation";
import React from "react";
import { StatusIndicator } from "../../../../components/ui/statusindicator/StatusIndicator";
import { UserRole } from "../../../../interfaces/enum/UserRole";
import { MousePointer } from 'lucide-react';
import { showToastConfirmation, showToastError } from "../../../../utility/confirmation/toastConfirmation";

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
        role: allowedRoles?.[0] ?? "", firstname: '', lastname: '',
        universityNumber: '', userId: '',
    });
    const criteria = useDebounce(rawCriteria, 300);
    const [page, setPage] = useState(0);

    const pageNum = mode === "select" ? 5 : 10;
    const { data, isFetching, isError, error, refetch } = useUserSearchPage(criteria, page, pageNum);
    useEffect(() => {
        setPage(0);
    }, [criteria]);

    const rows = data?.content ?? [];

    const hasAnyFilter = Boolean(
        rawCriteria.userId
        || rawCriteria.universityNumber
        || (rawCriteria.role)
    );
    const handleToggleActivation = async (id: number, active: boolean) => {
        const ok = await showToastConfirmation({
            title: active ? "Deactivate User" : "Activate User",
            message: `Are you sure you want to ${active ? 'deactivate' : 'activate'} this user?`,
            confirmText: active ? "Deactivate" : "Activate",
            cancelText: "Cancel",
            type: active ? "danger" : "info"
        });
        if (!ok) return;

        const success = active ? await fetchDeactivate(id) : await fetchActivate(id);
        if (success) {
            // invalidate both queries so UI refreshes
            refetch();
        } else {
            showToastError(`Failed to ${active ? 'deactivate' : 'activate'} user`);
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

    const handleFilterChange = useCallback((c: SearchCriteria) => {
        setRawCriteria(c);
    }, []);
  
    const handleNavConfirm = (e: React.MouseEvent, uId: number) => {
        if (!askForConfirmation) return;
        e.preventDefault();
        if (window.confirm('Navigate away? You’ll lose changes.')) {
            navigate(`/user/profile/${uId}`);
        }
    };
    return (
        <div>
            <div className="flex justify-between items-stretch mb-4">
                <div className="flex-1">
                    <SearchUserBar
                        criteria={rawCriteria}
                        setCriteria={handleFilterChange}
                        loading={isFetching}
                        allowedRoles={allowedRoles}
                        mode={mode}
                    />
                </div>
                {userRoles.includes('COORDINATOR') && mode == 'view' && (
                    <button onClick={() => navigate('/user/coordinator/browseuser/newuser')}
                        className="bg-[#040941] text-white px-4 py-1 rounded hover:bg-blue-800 transition-colors">
                        Add User
                    </button>
                )}
            </div>

            {isError && (
                <div className="text-red-500 mb-2">
                    {(error as Error).message}
                </div>
            )}

            <div className="overflow-x-auto w-full">
                {!hasAnyFilter && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <MousePointer className="w-20 h-20 text-gray-200 mb-6" />
                        <p className="text-xl text-gray-300 text-center font-semibold max-w-xl">
                            Please select a role (and/or enter a Student/Employee number or User ID) to begin.
                        </p>
                    </div>
                )}
                {isFetching && <StatusIndicator loading={isFetching}/>} 
                {hasAnyFilter && !isFetching && (
                    <table className={`min-w-full border-collapse ${mode === 'select' ? 'text-sm' : ''}`}>
                        <thead><tr>
                            {columns.map(col => <th key={String(col)} className={`border border-gray-300 bg-gray-100 ${mode === 'select' ? 'px-2 py-1 text-xs' : 'px-3 py-1'}`}>{labels[col]}</th>)}
                            <th className={`border border-gray-300 bg-gray-100 ${mode === 'select' ? 'px-2 py-1 text-xs' : 'px-3 py-1'}`}>Actions</th>
                        </tr></thead>
                        <tbody>
                            {rows.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    {columns.map(col => {
                                        let disp: any = (user as any)[col];
                                        if (col === 'name') disp = `${user.firstName} ${user.lastName}`.trim();
                                        if (col === 'createdAt' && disp) disp = formatDateForDisplay(new Date(disp));
                                        if (col === 'name') {
                                            return (
                                                <td key={col} className={`border border-gray-300 ${mode === 'select' ? 'px-2 py-1' : 'px-3 py-1'}`}>
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
                                        return <td key={col} className={`border border-gray-300 ${mode === 'select' ? 'px-2 py-1' : 'px-3 py-1'}`}>{disp}</td>;
                                    })}
                                    <td className={`border border-gray-300 ${mode === 'select' ? 'px-2 py-1' : 'px-3 py-1'}`}>
                                        {mode === 'select' ? (
                                            <button
                                                type="button"
                                                onClick={() => onSelect?.(user)}
                                                className={`text-blue-600 hover:text-red-300 ${mode === 'select' ? 'text-xs px-2 py-1' : ''}`}
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
                                                            ? "bg-red-800 hover:bg-red-600"
                                                            : "bg-green-800 hover:bg-green-600"
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
                )}
            </div>
            {hasAnyFilter && (
                <Pagination
                    page={page}
                    pageCount={data?.totalPages ?? 0}
                    onPrev={() => setPage(p => Math.max(0, p - 1))}
                    onNext={() => setPage(p => Math.min((data?.totalPages ?? 1) - 1, p + 1))}
                />
            )}
        </div>
    );
}
