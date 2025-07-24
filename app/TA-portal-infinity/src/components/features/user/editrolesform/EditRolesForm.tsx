import { useState } from 'react';
import { UserRole } from '../../../../interfaces/enum/UserRole';

interface Props {
  currentRoles: UserRole[];
  onSave: (newRoles: UserRole[]) => Promise<void>;
  onCancel: () => void;
}

const allRoles: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'COORDINATOR', 'ADMIN'];

export default function EditRolesForm({ currentRoles, onSave, onCancel }: Props) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(currentRoles);
  const [saving, setSaving] = useState(false);

  function toggleRole(role: UserRole) {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(selectedRoles);
    } catch (error) {
      console.error('Error saving roles:', error);
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border-t-4 border-[#040941] p-4 hover:shadow-lg transition-shadow duration-200 max-w-md">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#040941]">
          Manage Roles
        </h2>
        <p className="text-gray-500 text-sm mt-1">Update user role assignments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-3">
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

        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#040941] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#040941]/90 focus:outline-none focus:ring-2 focus:ring-[#040941] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 hover:border-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
