import { useEffect, useState } from "react";
import EditSectionProfileSection from "../edtionsectionprofilesection/EditSectionProfileSection";
import type { SectionProfile } from "../../../../interfaces/section/Section";
import { fetchUpdateUserDetails } from "../../../../api/student/fetchUpdateUserDetails";
import { useAuth } from "../../../../context/AuthContext";
import SectionProfileSection from "../sectionprofilesection/SectionProfileSection";
import type Section from "../../../../interfaces/section/Section";
import type SectionSchedule from "../../../../interfaces/section/SectionSchedule";
import { fetchUpdateSectionSchedule } from "../../../../api/section/sectionschedule/fetchUpdateSectionSchedule";
import { fetchAddSectionSchedule } from "../../../../api/section/sectionschedule/fetchAddSectionSchedule";
import EditSectionSchedule from "../editsectionschedule/EditSectionSchedule";
interface Props {
  section: Section;
  fields: (keyof SectionProfile)[];
  labels: Record<keyof SectionProfile, string>;
  fetchDetailsFunction: (sectionId: number) => Promise<Section>;
}

export default function SectionProfileDetailsSection({
  section: initial,
  fields,
  labels,
  fetchDetailsFunction,
}: Props) {
// const  isCoordinator = true;
  const { userRoles } = useAuth();
  const [section, setSection] = useState(initial);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    setSection(initial);
  }, [initial]);

  const isCoordinator = userRoles.includes("COORDINATOR");

  // Save schedule and refresh
  const handleSaveSchedule = async (sched: SectionSchedule) => {
    const id = section.sectionDetails!.sectionId!;
    if (sched.day) {
      await fetchUpdateSectionSchedule(id, sched);
    } else {
      await fetchAddSectionSchedule(id, sched);
    }
    const updated = await fetchDetailsFunction(id);
    setSection(updated);
  };

  // Toggle into profile edit
  const startProfileEdit = () => setIsEditingProfile(true);
  const cancelProfileEdit = () => setIsEditingProfile(false);

  return (
    <div className="relative">
      {isEditingProfile ? (
        <EditSectionProfileSection
          section={section.sectionDetails!}
          fields={fields}
          labels={labels}
          onSave={async updates => {
            // TODO: call profile update API, then refresh section
            setIsEditingProfile(false);
          }}
          onCancel={cancelProfileEdit}
        />
      ) : (
        <>
          <SectionProfileSection
            section={section}
            profileFields={fields}
            fieldLabels={labels}
            big
            isCourse={false}
            isCoordinator={isCoordinator}
            onSaveSchedule={handleSaveSchedule}
          />
          {isCoordinator && (
            <button
              onClick={startProfileEdit}
              className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded"
            >
              Edit Details
            </button>
          )}
        </>
      )}
    </div>
  );
}
