// src/components/features/user/EditProfileSection.tsx
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
  // Initialize form with exactly those keys
  const [form, setForm] = useState<Partial<T>>(
    Object.fromEntries(fields.map((k) => [k, user[k]])) as Partial<T>
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
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
      {fields.map((field) => (
        <div key={String(field)} className="flex flex-col">
          <label htmlFor={String(field)} className="font-semibold">
            {labels[field]}
          </label>
          <input
            id={String(field)}
            name={String(field)}
            value={String(form[field] ?? "")}
            onChange={handleChange}
            className="border px-2 py-1 rounded"
          />
        </div>
      ))}

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
