import { useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from "react";
import type { SectionProfile } from '../../../../interfaces/section/Section';
import type { SectionType } from "../../../../interfaces/section/SectionDetails";

export interface EditSectionProfileSectionProps {
  section: SectionProfile;
  fields: (keyof SectionProfile)[];
  labels: Record<keyof SectionProfile, string>;
  onSave: (updates: Partial<SectionProfile>) => Promise<void>;
  onCancel: () => void;
}

// Semester and SectionType options
const SEMESTER_OPTIONS = ["W1", "W2", "S1", "S2"];
export const SECTION_TYPE_OPTIONS :SectionType[] = [
  "Lecture",
  "Tutorial",
  "Laboratory",
  "Discussion",
  "Seminar",
  "Workshop",
  "Experential",
  "Independent Study",
] as const;

// type SectionTypea = typeof SECTION_TYPE_OPTIONS[number];

export default function EditSectionProfileSection({
  section,
  fields,
  labels,
  onSave,
  onCancel,
}: EditSectionProfileSectionProps) {
  const [form, setForm] = useState<Partial<SectionProfile>>(
    Object.fromEntries(fields.map((k) => [k, section[k]])) as Partial<SectionProfile>
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
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
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-white p-4 rounded shadow">
      {fields.map((field) => {
        const id = String(field);
        const value = form[field] ?? '';
        return (
          <div key={id} className="flex flex-col">
            <label htmlFor={id} className="text-sm block">
              {labels[field]}
            </label>
            {field === 'semester' ? (
              <select
                id={id}
                name={id}
                value={String(value)}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded px-3 py-2"
              >
                <option value="">Select semester</option>
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            ) : field === 'type' ? (
              <select
                id={id}
                name={id}
                value={String(value)}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded px-3 py-2"
              >
                <option value="">Select type</option>
                {SECTION_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={id}
                value={String(value)}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded px-3 py-2"
              />
            )}
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
          {saving ? 'Saving...' : 'Save'}
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
