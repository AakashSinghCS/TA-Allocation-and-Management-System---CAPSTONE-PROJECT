// src/components/EditProfileSection.tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
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
    if (name === "studentNumber" || name === "employeeNumber") {
      // maxLen: 8 for studentNumber, 10 for employeeNumber (adjust as desired)
      const maxLen = name === "studentNumber" ? 8 : 10;
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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      {fields.map((field) => {
        const isNumField = field === "studentNumber" || field === "employeeNumber";
        const maxLen = field === "studentNumber" ? 8 : field === "employeeNumber" ? 10 : undefined;

        return (
          <div key={String(field)} className="flex flex-col">
            <label htmlFor={String(field)} className="font-semibold">
              {labels[field]}
            </label>
            <input
              id={String(field)}
              name={String(field)}
              value={String(form[field] ?? "")}
              onChange={handleChange}
              // Numeric fields get numeric inputMode & maxLength
              {...(isNumField
                ? { inputMode: "numeric", maxLength : 8 }
                : {})}
              className="border px-2 py-1 rounded"
            />
          </div>
        );
      })}

      {error && <div className="text-red-500">{error}</div>}

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
