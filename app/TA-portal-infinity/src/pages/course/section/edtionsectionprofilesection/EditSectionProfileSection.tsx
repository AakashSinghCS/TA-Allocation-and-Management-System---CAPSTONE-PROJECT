import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { SectionProfile } from '../../../../interfaces/section/Section';
import { sectionTypeOptions, type SectionType } from "../../../../interfaces/section/SectionDetails";
import type { Instructor } from "../../../../interfaces/user/Instructor";
import UserBrowsingViewer from "../../../coordinator/userbrowsingpage/userbrowsingviewer/UserBrowsingViewer";
import type Section from "../../../../interfaces/section/Section";
import { fetchInstructorDetails } from "../../../../api/instructor/fetchInstructorDetails";
import { showToastSuccess, showToastError } from "../../../../utility/confirmation/toastConfirmation";

export interface EditSectionProfileSectionProps {
  sectionId : number;
  section: Section;
  fields: (keyof SectionProfile)[];
  labels: Record<keyof SectionProfile, string>;
  onSave: (updates: Partial<Section>) => Promise<void>;
  onCancel: () => void;
}

// Semester and SectionType options
const SEMESTER_OPTIONS = ["W1", "W2", "S1", "S2"];
export const SECTION_TYPE_OPTIONS: SectionType[] = sectionTypeOptions;

// type SectionTypea = typeof SECTION_TYPE_OPTIONS[number];
export default function EditSectionProfileSection({
  sectionId: _sectionId,
  section,
  fields,
  labels,
  onSave,
  onCancel,
}: EditSectionProfileSectionProps) {
  const [form, setForm] = useState<Partial<Section>>(Object.fromEntries(fields.map(k => [k, section[k]])) as Partial<Section>);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    async function loadInstructor() {
    if (section.instructor && section.instructor.id != null) {
      try {
        const inst:Instructor = await fetchInstructorDetails(section.instructor.id);
        setSelectedInstructor(inst);
      } catch (err) {
        console.error("Failed to load instructor details", err);
      }
    }
  }
  loadInstructor();
  },[section.instructorId])

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      ...form,
      instructorId: selectedInstructor?.id
    };

    try {
      await onSave(payload);
      showToastSuccess("Section details updated successfully");
    } catch (error) {
      showToastError("Failed to update section details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 -mt-6">
        <h2 className="text-3xl font-bold text-[#040941] mb-4">
          Edit Section Details
        </h2>
        <p className="text-gray-600 text-base">Update section information and instructor assignment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(field => {
          const id = String(field);
          const value = form[field] ?? '';
          return (
            <div key={id} className="flex flex-col space-y-2">
              <label htmlFor={id} className="text-sm font-semibold text-slate-700">{labels[field]}</label>
              {field === 'semester' ? (
                <select 
                  id={id} 
                  name={id} 
                  value={String(value)} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] transition-colors"
                >
                  <option value="">Select semester</option>
                  {SEMESTER_OPTIONS.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </select>
              ) : field === 'type' ? (
                <select 
                  id={id} 
                  name={id} 
                  value={String(value)} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] transition-colors"
                >
                  <option value="">Select type</option>
                  {SECTION_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <input 
                  id={id} 
                  name={id} 
                  value={String(value)} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] transition-colors"
                />
              )}
            </div>
          );
        })}
        
        {/* Instructor Selection */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-slate-700">Instructor</label>
          {selectedInstructor ? (
            <div className="flex items-center justify-between px-4 py-3 border border-gray-300">
              <span className="text-sm font-medium text-slate-700">
                {selectedInstructor.firstName} {selectedInstructor.lastName}
              </span>
              <button
                type="button"
                onClick={() => setSelectedInstructor(null)}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Search for an instructor and click SELECT in the far right column.</p>
              <div className="border border-gray-300 p-4">
                <UserBrowsingViewer
                  mode="select"
                  onSelect={u => setSelectedInstructor(u)}
                  allowedRoles={["Instructor"]}
                  askForConfirmation={true}
                />
              </div>
            </div>
          )}
        </div>

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
