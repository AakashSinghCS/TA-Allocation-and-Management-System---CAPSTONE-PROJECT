import { useState, type ChangeEvent, type FormEvent } from "react";
import { fetchAddSectionSchedule } from "../../../../api/section/sectionschedule/fetchAddSectionSchedule";
import type { SectionProfile } from '../../../../interfaces/section/Section';
import { sectionTypeOptions, type SectionType } from "../../../../interfaces/section/SectionDetails";
import type { Instructor } from "../../../../interfaces/user/Instructor";
import UserBrowsingViewer from "../../../../pages/userbrowsingpage/userbrowsingviewer/UserBrowsingViewer";
import EditSectionSchedule from "../editsectionschedule/EditSectionSchedule";

export interface EditSectionProfileSectionProps {
  sectionId : number;
  section: SectionProfile;
  fields: (keyof SectionProfile)[];
  labels: Record<keyof SectionProfile, string>;
  onSave: (updates: Partial<SectionProfile>) => Promise<void>;
  onCancel: () => void;
}

// Semester and SectionType options
const SEMESTER_OPTIONS = ["W1", "W2", "S1", "S2"];
export const SECTION_TYPE_OPTIONS: SectionType[] = sectionTypeOptions;

// type SectionTypea = typeof SECTION_TYPE_OPTIONS[number];
export default function EditSectionProfileSection({
  sectionId,
  section,
  fields,
  labels,
  onSave,
  onCancel,
}: EditSectionProfileSectionProps) {
  const [form, setForm] = useState<Partial<SectionProfile>>(Object.fromEntries(fields.map(k => [k, section[k]])) as Partial<SectionProfile>);
  const [showScheduleEdit, setShowScheduleEdit] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      instructorId: selectedInstructor?.id
    };

    await onSave(payload);
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
                  {SEMESTER_OPTIONS.map(sem => <option key={sem} value={sem}>{sem}</option>)}
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
        <div className="space-y-1">
          <label className="text-sm font-medium">Instructor</label>
          {selectedInstructor ? (
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
              <span>
                {selectedInstructor.firstName} {selectedInstructor.lastName}
              </span>
              <button
                type="button"
                onClick={() => setSelectedInstructor(null)}
                className="text-red-600 hover:underline text-sm"
              >
                Clear
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-400">Search for an Instructor and click on SELECT in the far right column. Don't select any Instructor, if you wish not to change instructors.</p>
              <UserBrowsingViewer
                mode="select"
                onSelect={u => setSelectedInstructor(u)}
                allowedRoles={["Instructor"]}
              />
              <div className="h-4" />
            </div>
          )}
        </div>
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
          onSave={async (sched) => {
            const ok = await fetchAddSectionSchedule(sectionId ,sched);
            if(ok) alert("Section Schedule added!");
            if(!ok) alert("Failed to add the section schedule!");
            return ok;
          }}
          onCancel={() => setShowScheduleEdit(false)}
        />
      )}
    </div>
  );
}
