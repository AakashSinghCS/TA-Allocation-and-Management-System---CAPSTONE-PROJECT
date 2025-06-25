import React, { useState, useCallback } from "react";
import { fetchAllSearchedUsers } from "../../../api/user/fetchAllSearchedUsers";
import type { Student } from "../../../interfaces/user/Student";
import type { Instructor } from "../../../interfaces/user/Instructor";
import type User from "../../../interfaces/user/User";
import { fetchDeleteUser } from "../../../api/user/fetchDeleteUser";

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

  const deleteUser = useCallback(async (id?: number) => {
    if (!id) return;
    const success = await fetchDeleteUser(id);
    if (success) {
      setSearchedUsers(prev => prev?.filter(u => u.id !== id) ?? []);
    } else {
      alert("Failed to delete user");
    }
  }, []);

  return { searchedUsers, loading, error, search, deleteUser, lastCriteria };
}

export default function SearchUserBar({ onSearch, loading,allowedRoles }: SearchUserBarProps) {
    const roles = allowedRoles ?? ["Student", "Instructor", "Coordinator"];
  const [criteria, setCriteria] = useState<SearchCriteria>({ role: roles[0], name: "", universityNumber: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(criteria);
  };

  const isUniversityNumberEntered = criteria.universityNumber.length > 0;

  return (
    <form className="flex space-x-2" onSubmit={handleSubmit}>
      <select
        value={criteria.role}
        onChange={e => setCriteria(c => ({ ...c, role: e.target.value as SearchCriteria['role'] }))}
        className="border px-2 py-1 rounded"
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
        className="border px-2 py-1 rounded"
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
        className="border px-2 py-1 rounded w-40"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
