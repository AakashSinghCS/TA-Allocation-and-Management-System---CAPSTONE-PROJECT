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
import { confirmSectionDeletion } from "../../../../utility/confirmation/section/confirmSectionDeletion";
import { validateSectionProfile } from "../../../../utility/validation/section/validateSectionProfile";
import SectionProfileSection from "../sectionprofilesection/SectionProfileSection";
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

  const isCoordinator = userRoles.includes("COORDINATOR");

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
    const confirm = confirmSectionDeletion();
    if (!confirm) return;
    const ok = await fetchDeleteSection(section?.id ?? -1);
    if (ok) navigate(-1);
  }

  const onSave = async (updates: Partial<SectionProfile>) => {
    if (!section) return;
    const { ok, sanitized, errors } = validateSectionProfile(updates);
    if (!ok) {
      alert(`Please fix the following:\n• ${errors.join("\n• ")}`);
      return;
    }
    const success = await fetchUpdateSectionDetails(section?.id ?? -1, sanitized);
    if (success) setSection(await fetchSectionIncludeInstructorId(section.course?.id ?? -1))
    setIsEditingProfile(false);
  }

  return (
    <div className="relative">
      {section && isEditingProfile ? (
        <EditSectionProfileSection
          sectionId={section.course?.id ?? -1}
          section={section!}
          fields={fields}
          labels={labels}
          onSave={onSave}
          onCancel={cancelProfileEdit}
        />
      ) : (
        <>
          <SectionProfileSection
            section={section}
            profileFields={fields}
            fieldLabels={labels}
            isCourse={false}
            isCoordinator={isCoordinator}
            onSaveSchedule={handleSaveSchedule}
          />
          {isCoordinator && (
            <div className="absolute top-2 right-2 flex gap-3 text-white px-2 py-1 rounded">
              <button
                onClick={deleteCourse}
                className="bg-red-400"
              >
                Delete
              </button>
              <button
                onClick={startProfileEdit}
                className="bg-[#040941]"
              >
                Edit Details
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
