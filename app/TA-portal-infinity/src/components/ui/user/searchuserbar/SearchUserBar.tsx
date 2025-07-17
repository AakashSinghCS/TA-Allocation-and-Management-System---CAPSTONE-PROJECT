import { useCallback, useState } from "react";
import { fetchAllSearchedUsers } from "../../../../api/user/fetchAllSearchedUsers";
import { fetchDeleteUser } from "../../../../api/user/fetchDeleteUser";
import type { Instructor } from "../../../../interfaces/user/Instructor";
import type { Student } from "../../../../interfaces/user/Student";
import type User from "../../../../interfaces/user/User";
import { confirmDeletion } from "../../../../utility/confirmation/confirmDeletion";
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
  onSearch: (criteria: SearchCriteria) => Promise<void>;
  loading: boolean;
  allowedRoles?: SearchCriteria['role'][];
  mode: string;
}

export function useUserSearch<T extends User>() {
  const [searchedUsers, setSearchedUsers] = useState<(T & { role: SearchCriteria['role'] })[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCriteria, setLastCriteria] = useState<SearchCriteria>({ role: "Student", firstname: "", lastname: "", universityNumber: "", userId: "" });

  const search = useCallback(async (criteria: SearchCriteria) => {
    setLastCriteria(criteria);
    setLoading(true);
    setError(null);
    try {
      const req = {
        role: criteria.role,
        ...(criteria.firstname ? { firstname: criteria.firstname } : {}),
        ...(criteria.lastname ? { lastname: criteria.lastname } : {}),
        ...(criteria.universityNumber ? { universityNumber: parseInt(criteria.universityNumber, 10) || 0 } : {}),
        ...(criteria.userId ? { userId: criteria.userId.trim() } : {})
      };
      const data =
        criteria.role === "Student"
          ? await fetchAllSearchedUsers<Student>(req)
          : criteria.role === "Instructor"
            ? await fetchAllSearchedUsers<Instructor>(req)
            : await fetchAllSearchedUsers<User>(req);
      const tagged = (data ?? []).map(u => ({ ...u, role: criteria.role })) as (T & { role: SearchCriteria['role'] })[];;
      setSearchedUsers(tagged);
    } catch {
      setError("Failed to fetch users");
      setSearchedUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id?: number) => {
    if (!id) return;
    const confirm = confirmDeletion("user", "This will delete associated .....");
    if (!confirm) return;
    const success = await fetchDeleteUser(id);
    if (success) {
      setSearchedUsers(prev => prev?.filter(u => u.id !== id) ?? []);
    } else {
      alert("Failed to delete user");
    }
  }, []);

  return { searchedUsers, loading, error, search, deleteUser, lastCriteria };
}

export default function SearchUserBar({ onSearch, loading, allowedRoles, mode = "view" }: SearchUserBarProps) {
  const roles = allowedRoles ?? ["Student", "Instructor", "Coordinator"];
  const [criteria, setCriteria] = useState<SearchCriteria>({ role: "", firstname: "", lastname: "", universityNumber: "", userId: "" });
  const loggedInRoles = useAuth().userRoles;
  const isAdminOrCoordinator = loggedInRoles.includes(UserRole.ADMIN || UserRole.COORDINATOR);
  const handleSearch = async () => {
    await onSearch(criteria);
  };

  const isUniversityNumberEntered = criteria.universityNumber ? criteria.universityNumber.length > 0 : false;
  const isUserIDEntered = criteria.userId ? criteria.userId?.length > 0 : false;
  const isFirstNameEntered = criteria.firstname ? criteria.firstname.length > 0 : false;
  const isLastNameEntered = criteria.lastname ? criteria.lastname.length > 0 : false;

  const smallModePadding = mode === "select" ? "px-2 py-1" : ""
  const isFlexCol = mode ==="select" ? "flex-col" : ""
  return (
    <div className={isFlexCol + ` flex flex-wrap w-full gap-2`}>
      <div className="flex flex-wrap gap-2 min-w-0">
        <select
          value={criteria.role}
          onChange={e => setCriteria(c => ({ ...c, role: e.target.value as SearchCriteria['role'] }))}
          disabled={isUniversityNumberEntered || isUserIDEntered}
          className={smallModePadding + ` flex-1 border border-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100`}
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
          onChange={e => setCriteria(c => ({ ...c, firstname: e.target.value.trimStart() }))}
          disabled={isUniversityNumberEntered || isUserIDEntered}
          className="flex-1 border px-2 py-1 border-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={criteria.lastname}
          onChange={e => setCriteria(c => ({ ...c, lastname: e.target.value.trimStart() }))}
          disabled={isUniversityNumberEntered || isUserIDEntered}
          className="flex-1 border px-2 py-1 border-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>
      <div className="flex flex-wrap gap-2 min-w-0">
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="University Number"
          value={criteria.universityNumber}
          disabled={isUserIDEntered || isFirstNameEntered || isLastNameEntered}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 8).trimStart();
            setCriteria(c => ({
              ...c, universityNumber: digits,
              role: digits.length > 0 ? "" : c.role,
              firstname: digits.length > 0 ? "" : c.firstname,
              lastname: digits.length > 0 ? "" : c.lastname,
              userId: digits.length > 0 ? "" : c.userId
            }));
          }}
          className="flex-1 border px-2 py-1 border-gray-400 rounded-md w-40 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        {isAdminOrCoordinator && <input
          type="text"
          inputMode="numeric"
          placeholder="User ID"
          value={criteria.userId}
          disabled={isUniversityNumberEntered || isFirstNameEntered || isLastNameEntered}
          onChange={e => {
            const value = e.target.value.trimStart();
            setCriteria(c => ({
              ...c, userId: value,
              role: value.length > 0 ? "" : c.role,
              firstname: value.length > 0 ? "" : c.firstname,
              lastname: value.length > 0 ? "" : c.lastname,
              universityNumber: value.length > 0 ? "" : c.universityNumber
            }));
          }}
          className="flex-1 border px-2 py-1 border-gray-400 rounded-md w-40 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        }
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#040941] text-white px-4 py-1 rounded hover:bg-[#040491] transition-colors disabled:opacity-50 "
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
    </div>
  );
}
