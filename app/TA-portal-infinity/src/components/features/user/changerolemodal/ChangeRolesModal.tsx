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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-2xl w-96 shadow-lg border-t-4 border-[#040941]">
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-light transition-colors"
          aria-label="Close modal"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-4 text-[#040941]">Manage User Roles</h2>

        <div className="space-y-3 mb-6">
          {allRoles.map(role => (
            <label key={role} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                  selectedRoles.includes(role) 
                    ? 'bg-[#040941] border-[#040941]' 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {selectedRoles.includes(role) && (
                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                {role}
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 hover:border-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedRoles)}
            className="px-4 py-2 bg-[#040941] text-white rounded-lg hover:bg-[#040941]/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
