// src/pages/userBrowsing/NewUserPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ManualCreateUserPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Student" | "Instructor" | "Coordinator">("Student");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call your real create API here
    console.log("Creating user:", { firstName, lastName, email, role });
    navigate(-1); // go back
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Add New User</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block mb-1">First Name</label>
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Last Name</label>
          <input
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as any)}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="Student">Student</option>
            <option value="Instructor">Instructor</option>
            <option value="Coordinator">Coordinator</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-1 rounded border"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1 rounded bg-green-500 text-white hover:bg-green-600"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
