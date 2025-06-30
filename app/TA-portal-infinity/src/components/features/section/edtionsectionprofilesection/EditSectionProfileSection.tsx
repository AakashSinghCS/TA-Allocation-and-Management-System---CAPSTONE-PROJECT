import { useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from "react";
import type { SectionProfile } from '../../../../interfaces/section/Section';
import type { SectionType } from "../../../../interfaces/section/SectionDetails";
import EditSectionSchedule from "../editsectionschedule/EditSectionSchedule";

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
  const [form, setForm] = useState<Partial<SectionProfile>>(Object.fromEntries(fields.map(k => [k, section[k]])) as Partial<SectionProfile>);
  const [showScheduleEdit, setShowScheduleEdit] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSave(form);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2 bg-white p-4 rounded shadow">
        {fields.map(field => {
          const id = String(field);
          const value = form[field] ?? '';
          // render inputs/selects (unchanged from before)
          return (
            <div key={id} className="flex flex-col">
              <label htmlFor={id} className="text-sm block">{labels[field]}</label>
              {field === 'semester' ? (
                <select id={id} name={id} value={String(value)} onChange={handleChange} className="w-full border rounded px-3 py-2">
                  <option value="">Select semester</option>
                  {['W1','W2','S1','S2'].map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </select>
              ) : field === 'type' ? (
                <select id={id} name={id} value={String(value)} onChange={handleChange} className="w-full border rounded px-3 py-2">
                  <option value="">Select type</option>
                  {SECTION_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <input id={id} name={id} value={String(value)} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              )}
            </div>
          );
        })}
        <div className="flex space-x-2">
          <button type="submit" className="bg-[#00C774] text-white px-2 py-1 rounded hover:bg-[#1FE88D]">Save</button>
          <button type="button" onClick={onCancel} className="py-1 px-2 rounded hover:bg-red-100">Cancel</button>
        </div>
      </form>

      <button
        onClick={() => setShowScheduleEdit(true)}
        className="mt-2 text-sm text-green-600 hover:underline"
      >
        + Add Schedule
      </button>

      {showScheduleEdit && (
        <EditSectionSchedule
          onSave={sched => {
            /* handled in parent */
          }}
          onCancel={() => setShowScheduleEdit(false)}
        />
      )}
    </div>
  );
}
