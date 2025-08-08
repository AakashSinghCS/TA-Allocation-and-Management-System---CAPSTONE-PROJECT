// src/components/EditProfileSection.tsx
import { useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from "react";
import type User from "../../../../interfaces/user/User";
import { validateProfileData } from "../../../../utility/validation/user/validateProfileData";

interface Props<T extends User> {
  user: T;
  fields: (keyof T)[];
  labels: Record<keyof T, string>;
  onSave: (updates: Partial<T>) => Promise<void>;
  onCancel: () => void;
}

export default function EditProfileSection<T extends User>({
  user,
  fields,
  labels,
  onSave,
  onCancel,
}: Props<T>) {
  const [form, setForm] = useState<Partial<T>>(
    Object.fromEntries(fields.map((k) => [k, user[k]])) as Partial<T>
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof T, string>>>({});

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    // If this is studentNumber or employeeNumber, strip non-digits and enforce length
    if (name === "studentNumber" || name === "employeeNumber" || name === "schoolYear" || name === "enrollmentYear") {

      const maxLen = name === "studentNumber" || name === "employeeNumber" ? 8 : name === "schoolYear" ? 1 : name === "enrollmentYear" ? 4 : 8;
      const digits = value.replace(/\D/g, "");
      setForm((f) => ({
        ...f,
        [name]: (digits.slice(0, maxLen) as any)
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const { ok, sanitized, fieldErrors } = validateProfileData(form, fields);
    if (!ok) {
      setFieldErrors(fieldErrors);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(sanitized);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border-t-4 border-[#040941] p-4 hover:shadow-lg transition-shadow duration-200">
      {/* Header without Avatar */}
      <div className="mb-4 pb-3 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#040941]">
          Edit Profile
        </h2>
        <p className="text-gray-500 text-sm mt-1">Update your profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field) => {
          let props: Partial<InputHTMLAttributes<HTMLInputElement>> = {};

          switch (field) {
            case "studentNum":
            case "employeeNum":
              props = { inputMode: "numeric", maxLength: 8, placeholder: "e.g. 12345678" };
              break;

            case "enrollmentYear":
              props = { inputMode: "numeric", maxLength: 4, placeholder: "e.g. 2024" };
              break;

            case "schoolYear":
              props = { inputMode: "numeric", maxLength: 1, placeholder: "e.g. 1" };
              break;
            case "program":
              props = { inputMode: "text", placeholder: "e.g. B.Sc., Major in ..." };
              break;
            case "dept":
              props = { inputMode: "text", placeholder: "e.g. Computer Science, Data Science, Mathematics" };
              break;
            default:

          }

          return (
            <div key={String(field)} className="space-y-1">
              <label htmlFor={String(field)} className="block text-sm font-semibold text-gray-700">
                {labels[field]}
              </label>
              <input
                id={String(field)}
                name={String(field)}
                value={String(form[field] ?? "")}
                onChange={handleChange}
                {...props}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#040941] focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400"
              />
              {fieldErrors[field] && (
                <div className="text-red-500 text-xs mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors[field]}
                </div>
              )}
            </div>
          );
        })}

        {error && (
          <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

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
