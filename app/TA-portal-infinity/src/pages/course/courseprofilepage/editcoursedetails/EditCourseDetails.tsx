import { useState, type ChangeEvent, type FormEvent } from "react";
import type { CourseProfile } from "../../../../interfaces/course/Course";
import { showToastSuccess, showToastError } from "../../../../utility/confirmation/toastConfirmation";

export interface EditCourseDetailsProps {
  courseId : number;
  course: CourseProfile;
  fields: (keyof CourseProfile)[];
  labels: Record<keyof CourseProfile, string>;
  onSave: (updates: Partial<CourseProfile>) => Promise<void>;
  onCancel: () => void;
}

export default function EditCourseDetails({
  courseId: _courseId,
  course,
  fields,
  labels,
  onSave,
  onCancel,
}: EditCourseDetailsProps) {
  const [form, setForm] = useState<Partial<CourseProfile>>(Object.fromEntries(fields.map(k => [k, course[k]])) as Partial<CourseProfile>);
  const [saving, setSaving] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      ...form,
    };

    try {
      await onSave(payload);
    } catch (error) {
      // Optionally handle error locally if needed
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 -mt-6">
        <h2 className="text-2xl font-bold text-[#040941] mb-2">
          Edit Course Details
        </h2>
        <p className="text-gray-600 text-base">Update course information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(field => {
          const id = String(field);
          const value = form[field] ?? '';
          return (
            <div key={id} className="flex flex-col space-y-2">
              <label htmlFor={id} className="text-sm font-semibold text-slate-700">{labels[field]}</label>
              <input 
                id={id} 
                name={id} 
                value={String(value)} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] transition-colors"
              />
            </div>
          );
        })}
        
        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-[#040941] text-white font-semibold py-2 px-8 rounded-lg hover:bg-[#040941]/90 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            className="bg-gray-100 text-gray-700 font-semibold py-2 px-8 rounded-lg hover:bg-gray-200 transition-all text-base border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
