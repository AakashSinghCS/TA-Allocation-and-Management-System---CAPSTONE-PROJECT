// src/components/EditProfileSection.tsx
import { useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from "react";
import type User from "../../../../interfaces/user/User";

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

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    // If this is studentNumber or employeeNumber, strip non-digits and enforce length
    if (name === "studentNumber" || name === "employeeNumber" || name === "schoolYear" || name === "enrollmentYear") {
  
      const maxLen = name === "studentNumber" || name ==="employeeNumber" ? 8 : name === "schoolYear" ? 1 : name === "enrollmentYear" ? 4: 8;
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
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-white p-4 rounded shadow">
      {fields.map((field) => {
        let numericProps: Partial<InputHTMLAttributes<HTMLInputElement>> = {};

        switch (field) {
          case "studentNumber":
          case "employeeNumber":
            numericProps = { inputMode: "numeric", maxLength: 8 };
            break;

          case "enrollmentYear":
            numericProps = { inputMode: "numeric", maxLength: 4 };
            break;

          case "schoolYear":
            numericProps = { inputMode: "numeric", maxLength: 1 };
            break;

          default:

        }

        return (
          <div key={String(field)} className="flex flex-col">
            <label htmlFor={String(field)} className="text-sm block">
              {labels[field]}
            </label>
            <input
              id={String(field)}
              name={String(field)}
              value={String(form[field] ?? "")}
              onChange={handleChange}
              {...numericProps}
              className="w-full border border-gray-400 rounded px-3 py-2"
            />
          </div>
        );
      })}

      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#00C774] text-white px-2 py-1 rounded hover:bg-[#1FE88D] transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="py-1 px-2 rounded hover:bg-red-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>

  );
}
