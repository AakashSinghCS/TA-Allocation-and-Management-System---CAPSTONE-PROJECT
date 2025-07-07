import { useState, type ChangeEvent, type FormEvent } from "react";
import type { CourseProfile } from "../../../../interfaces/course/Course";

export interface EditCourseDetailsProps {
  courseId : number;
  course: CourseProfile;
  fields: (keyof CourseProfile)[];
  labels: Record<keyof CourseProfile, string>;
  onSave: (updates: Partial<CourseProfile>) => Promise<void>;
  onCancel: () => void;
}

export default function EditCourseDetails({
  courseId,
  course,
  fields,
  labels,
  onSave,
  onCancel,
}: EditCourseDetailsProps) {
  const [form, setForm] = useState<Partial<CourseProfile>>(Object.fromEntries(fields.map(k => [k, course[k]])) as Partial<CourseProfile>);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
    };
    await onSave(payload);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2 bg-white p-4 rounded shadow">
        {fields.map(field => {
          const id = String(field);
          const value = form[field] ?? '';
          return (
            <div key={id} className="flex flex-col">
              <label htmlFor={id} className="text-sm block">{labels[field]}</label>
                <input id={id} name={id} value={String(value)} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          );
        })}
        
        <div className="flex space-x-2">
          <button type="submit" className="bg-[#00C774] text-white px-2 py-1 rounded hover:bg-[#1FE88D]">Save</button>
          <button type="button" onClick={onCancel} className="py-1 px-2 rounded hover:bg-red-100">Cancel</button>
        </div>
      </form>

    </div>
  );
}
