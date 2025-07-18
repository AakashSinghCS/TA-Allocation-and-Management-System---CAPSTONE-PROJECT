import { useCallback, useState } from "react";
import { fetchAllSearchedUsers } from "../../../../api/user/fetchAllSearchedUsers";
import { fetchActivate } from "../../../../api/admin/fetchActivation";
import { fetchDeactivate } from "../../../../api/admin/fetchActivation";
import type { Instructor } from "../../../../interfaces/user/Instructor";
import type { Student } from "../../../../interfaces/user/Student";
import type User from "../../../../interfaces/user/User";
import { confirmDeletion } from "../../../../utility/confirmation/confirmDeletion";

export interface SearchCriteria {
  role: "Student" | "Instructor" | "Coordinator";
  name: string;
  universityNumber: string;
}

interface SearchUserBarProps {
  onSearch: (criteria: SearchCriteria) => Promise<void>;
  loading: boolean;
  allowedRoles?: SearchCriteria['role'][];
}

export function useUserSearch<T extends User>() {
  const [searchedUsers, setSearchedUsers] = useState<(T & { role: SearchCriteria['role'] })[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCriteria, setLastCriteria] = useState<SearchCriteria>({ role: "Student", name: "", universityNumber: "" });

  const search = useCallback(async (criteria: SearchCriteria) => {
    setLastCriteria(criteria);
    setLoading(true);
    setError(null);
    try {
      const req = { role: criteria.role, name: criteria.name, universityNumber: parseInt(criteria.universityNumber, 10) || 0 };
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

  const toggleActivation = useCallback(async (id?: number, currentlyActive?: boolean) => {
    if (!id || currentlyActive === undefined) return;

    const action = currentlyActive ? "deactivate" : "activate";
    const confirmed = window.confirm(`Are you sure you want to ${action} this user?`);
    if (!confirmed) return;

    const success = currentlyActive
      ? await fetchDeactivate(id)
      : await fetchActivate(id);

    if (success) {
      setSearchedUsers(prev =>
        prev?.map(u =>
          u.id === id ? { ...u, active: !currentlyActive } : u
        ) ?? []
      );
    } else {
      alert(`Failed to ${action} user`);
    }
  }, []);

  return { searchedUsers, loading, error, search, toggleActivation, lastCriteria };
}

export default function SearchUserBar({ onSearch, loading,allowedRoles }: SearchUserBarProps) {
    const roles = allowedRoles ?? ["Student", "Instructor", "Coordinator"];
  const [criteria, setCriteria] = useState<SearchCriteria>({ role: roles[0], name: "", universityNumber: "" });

   const handleSearch = async () => {
    await onSearch(criteria);
  };

  const isUniversityNumberEntered = criteria.universityNumber.length > 0;

  return (
    <div className="flex space-x-2">
      <select
        value={criteria.role}
        onChange={e => setCriteria(c => ({ ...c, role: e.target.value as SearchCriteria['role'] }))}
        className="border px-2 py-1 border-gray-400 rounded-md"
      >
        {roles.map(r => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Name"
        value={criteria.name}
        onChange={e => setCriteria(c => ({ ...c, name: e.target.value }))}
        disabled={isUniversityNumberEntered}
        className="border px-2 py-1 border-gray-400 rounded-md"
      />
      <input
        type="text"
        inputMode="numeric"
        maxLength={8}
        placeholder="University Number"
        value={criteria.universityNumber}
        onChange={e => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
          setCriteria(c => ({ ...c, universityNumber: digits, name: digits.length > 0 ? "" : c.name }));
        }}
        className="border px-2 py-1 border-gray-400 rounded-md w-40"
      />
      <button
        type="button"
        onClick={handleSearch}
        disabled={loading}
        className="bg-[#040941] text-white px-4 py-1 rounded hover:bg-[#040491] transition-colors disabled:opacity-50"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </div>
  );
}
