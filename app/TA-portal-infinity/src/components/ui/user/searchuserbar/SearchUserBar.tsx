import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { UserRole } from "../../../../interfaces/enum/UserRole";
export interface SearchCriteria {
  role: "Student" | "Instructor" | "Coordinator" | "";
  firstname?: string;
  lastname?: string;
  universityNumber?: string;
  userId?: string;
}

interface SearchUserBarProps {
  criteria: SearchCriteria;
  setCriteria: (c: SearchCriteria) => void;
  loading: boolean;
  allowedRoles?: SearchCriteria['role'][];
  mode?: "view" | "select";
}

export default function SearchUserBar({ criteria, setCriteria, loading, allowedRoles, mode = 'view', }: SearchUserBarProps) {
  const roles = allowedRoles ?? ["Student", "Instructor", "Coordinator"];
  const loggedInRoles = useAuth().userRoles;
  const isAdminOrCoordinator = loggedInRoles.includes(UserRole.ADMIN || UserRole.COORDINATOR);
  const [showHiddenFilters, setShowHiddenFilters] = useState(false);
  const disableRoleSelect = Boolean(criteria.universityNumber || criteria.userId);
  const disableNameInputs = Boolean(criteria.universityNumber || criteria.userId);

  const onChangeField = <K extends keyof SearchCriteria>(key: K, val: SearchCriteria[K]) => {
    setCriteria({
      ...criteria,
      [key]: val,
      // clear mutually exclusive fields:
      ...(key === 'universityNumber' && val ? { firstname: '', lastname: '', role: '' } : {}),
      ...(key === 'userId' && val ? { firstname: '', lastname: '', role: '' } : {}),
      ...((key === 'firstname' || key === 'lastname') && !criteria.universityNumber && !criteria.userId
        ? {}
        : {}),
    });
  };

  const smallModePadding = mode === "select" ? "px-2 py-1" : ""
  const isFlexCol = mode ==="select" ? "flex-col" : ""
  return (
    <div className={`flex flex-wrap w-full gap-2 ${mode === 'select' ? 'text-sm' : ''}`}>
      <div className={`flex flex-wrap gap-2 min-w-0 ${mode === 'select' ? 'w-full' : ''}`}>
        {/* <StatusIndicator loading={loading}/> */}
        <select
          value={criteria.role}
          onChange={e => onChangeField('role', e.target.value as any)}
          disabled={disableRoleSelect}
          className={`flex-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'select' ? 'px-2 py-1 text-sm' : ''}`}
        >
          <option value="">Select a role</option>
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="First Name"
          value={criteria.firstname}
          onChange={e => onChangeField('firstname', e.target.value)}
          disabled={disableNameInputs}
          className={`flex-1 border border-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 ${mode === 'select' ? 'px-2 py-1 text-sm' : 'px-2 py-1'}`}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={criteria.lastname}
          onChange={e => onChangeField('lastname', e.target.value)}
          disabled={disableNameInputs}
          className={`flex-1 border border-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 ${mode === 'select' ? 'px-2 py-1 text-sm' : 'px-2 py-1'}`}
        />
        {mode === 'select' && (
          <button
            type="button"
            onClick={() => setShowHiddenFilters((prev) => !prev)}
            className="flex items-center justify-center border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 transition text-sm"
          >
            {showHiddenFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      {(mode === 'view' || (mode === 'select' && showHiddenFilters)) && (
      <div className={`flex flex-wrap gap-2 min-w-0 ${mode === 'select' ? 'w-full' : ''}`}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="University Number"
          value={criteria.universityNumber}
          onChange={e => onChangeField('universityNumber', e.target.value)}
          disabled={Boolean(criteria.userId) || Boolean(criteria.firstname) || Boolean(criteria.lastname) || Boolean(criteria.role)}
          className={`flex-1 border border-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 ${mode === 'select' ? 'px-2 py-1 text-sm w-32' : 'px-2 py-1 w-40'}`}
        />
        {isAdminOrCoordinator && <input
          type="text"
          inputMode="numeric"
          placeholder="User ID (Exact Match)"
          value={criteria.userId}
          disabled={Boolean(criteria.universityNumber) || Boolean(criteria.firstname) || Boolean(criteria.lastname) || Boolean(criteria.role)}
          onChange={e => onChangeField('userId', e.target.value)}
          className={`flex-1 border border-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 ${mode === 'select' ? 'px-2 py-1 text-sm w-32' : 'px-2 py-1 w-40'}`}
        />
        }
      </div>
      )}
    </div>
  );
}
