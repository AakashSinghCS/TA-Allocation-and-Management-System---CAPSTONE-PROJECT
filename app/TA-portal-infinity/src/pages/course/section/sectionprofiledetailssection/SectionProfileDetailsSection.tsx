import { useEffect, useState } from "react";
import EditSectionProfileSection from "../edtionsectionprofilesection/EditSectionProfileSection";
import type { SectionProfile } from "../../../../interfaces/section/Section";
import { useAuth } from "../../../../context/AuthContext";
import type Section from "../../../../interfaces/section/Section";
import type SectionSchedule from "../../../../interfaces/section/SectionSchedule";
import { fetchUpdateSectionSchedule } from "../../../../api/section/sectionschedule/fetchUpdateSectionSchedule";
import { fetchAddSectionSchedule } from "../../../../api/section/sectionschedule/fetchAddSectionSchedule";
import { fetchSectionIncludeInstructorId } from "../../../../api/section/fetchSectionIncludeInstructorId";
import { fetchUpdateSectionDetails } from "../../../../api/section/fetchUpdateSectionDetails";
import { fetchDeleteSection } from "../../../../api/section/fetchDeleteSection";
import { useNavigate } from "react-router-dom";
import { validateSectionProfile } from "../../../../utility/validation/section/validateSectionProfile";
import SectionProfileSection from "../sectionprofilesection/SectionProfileSection";
import { UserRole } from "../../../../interfaces/enum/UserRole";
import { fetchDeleteSectionSchedule } from "../../../../api/section/sectionschedule/fetchDeleteSectionSchedule";
import { ToastContainer } from 'react-toastify';
import { showToastConfirmation, showToastSuccess, showToastError } from "../../../../utility/confirmation/toastConfirmation";

interface Props {
  section: Section | null;
  fields: (keyof SectionProfile)[];
  labels: Record<keyof SectionProfile, string>;
}

export default function SectionProfileDetailsSection({
  section: initial,
  fields,
  labels,
}: Props) {
  // const  isCoordinator = true;
  const navigate = useNavigate();
  const { userRoles } = useAuth();
  const [section, setSection] = useState(initial);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    setSection(initial);
  }, [initial]);

  const isCoordinatorOrAdmin = userRoles.includes(UserRole.COORDINATOR || UserRole.ADMIN);

  // Save schedule and refresh
  const handleSaveSchedule = async (sched: SectionSchedule, isUpdate: boolean): Promise<boolean> => {
    if (!section) return false;
    const id = section!.id!;
    let ok = false;
    if (isUpdate) {
      ok = await fetchUpdateSectionSchedule(sched.id ?? -1, sched);
    } else {
      ok = await fetchAddSectionSchedule(id, sched);
    }
    const updated = await fetchSectionIncludeInstructorId(id);
    setSection(updated ?? {});
    return ok;
  };

  // Toggle into profile edit
  const startProfileEdit = () => setIsEditingProfile(true);
  const cancelProfileEdit = () => setIsEditingProfile(false);
  
  const deleteCourse = async () => {
    const confirmed = await showToastConfirmation({
      title: "Delete Section",
      message: "Are you sure you want to delete this section? This will delete associated schedule and exam data.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger"
    });
    
    if (!confirmed) return;
    
    try {
      const ok = await fetchDeleteSection(section?.id ?? -1);
      if (ok) {
        showToastSuccess("Section deleted successfully");
        navigate(-1);
      } else {
        showToastError("Failed to delete section");
      }
    } catch (error) {
      showToastError("Failed to delete section");
    }
  }

  const onSave = async (updates: Partial<Section>) => {
    if (!section) return;
    const { ok, sanitized, errors } = validateSectionProfile(updates);
    if (!ok) {
      alert(`Please fix the following:\n• ${errors.join("\n• ")}`);
      return;
    }
    const success = await fetchUpdateSectionDetails(section?.id ?? -1, {instructorId:updates.instructorId,...sanitized});
    if (success) setSection(await fetchSectionIncludeInstructorId(section.id ?? -1))
    setIsEditingProfile(false);
  }

  const handleDeleteSchedule = async (id:number)=>{
    const confirmed = await showToastConfirmation({
      title: "Delete Schedule Slot",
      message: "Are you sure you want to delete this schedule slot? This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger"
    });
    
    if (!confirmed) return false;

    try {
      const success = await fetchDeleteSectionSchedule(id);

      if (success) {
        showToastSuccess('Schedule deleted successfully');
        const updated = await fetchSectionIncludeInstructorId(section!.id!);
         setSection(updated ?? {});
      } else {
        showToastError('Failed to delete schedule');
      }
      
      return success;
    } catch (error) {
      showToastError('Failed to delete schedule');
      return false;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 border border-gray-200 rounded-2xl bg-white shadow-sm">
      {section && isEditingProfile ? (
        <EditSectionProfileSection
          sectionId={section.course?.id ?? -1}
          section={section}
          fields={fields}
          labels={labels}
          onSave={onSave}
          onCancel={cancelProfileEdit}
        />
      ) : (
        <div className="w-full">
          <SectionProfileSection
            section={section}
            profileFields={fields}
            fieldLabels={labels}
            isCourse={false}
            isCoordinator={isCoordinatorOrAdmin}
            onSaveSchedule={handleSaveSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
          {isCoordinatorOrAdmin && (
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={deleteCourse}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all font-medium text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
              <button
                onClick={startProfileEdit}
                className="bg-[#040941] text-white px-4 py-2 rounded hover:bg-[#040941]/90 transition-all font-medium text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Details</span>
              </button>
            </div>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
