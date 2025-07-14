import { useState } from "react";
import { UserRole } from "../../../../interfaces/enum/UserRole";

interface Props {
  currentRoles: UserRole[];
  onClose: () => void;
  onSave: (roles: UserRole[]) => Promise<void>;
}

const allRoles: UserRole[] = ["STUDENT", "INSTRUCTOR", "COORDINATOR", "ADMIN"];

export default function ChangeRolesModal({ currentRoles, onClose, onSave }: Props) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(currentRoles);

  function toggleRole(role: UserRole) {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  }

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg w-80 shadow-lg border border-slate-200">
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
        >
          &times;
        </button>

        <h2 className="text-lg font-bold mb-4">Change Roles</h2>

        <div className="space-y-2">
          {allRoles.map(role => (
            <label key={role} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />
              {role}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedRoles)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
