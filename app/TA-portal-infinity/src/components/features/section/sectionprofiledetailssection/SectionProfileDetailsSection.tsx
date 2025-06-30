import { useEffect, useState } from "react";
import EditSectionProfileSection from "../edtionsectionprofilesection/EditSectionProfileSection";
import type { SectionProfile } from "../../../../interfaces/section/Section";
import { useAuth } from "../../../../context/AuthContext";
import SectionProfileSection from "../sectionprofilesection/SectionProfileSection";
import type Section from "../../../../interfaces/section/Section";
import type SectionSchedule from "../../../../interfaces/section/SectionSchedule";
import { fetchUpdateSectionSchedule } from "../../../../api/section/sectionschedule/fetchUpdateSectionSchedule";
import { fetchAddSectionSchedule } from "../../../../api/section/sectionschedule/fetchAddSectionSchedule";
import { fetchSection } from "../../../../api/section/fetchSection";
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
  const { userRoles } = useAuth();
  const [section, setSection] = useState(initial);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    setSection(initial);
  }, [initial]);

  const isCoordinator = userRoles.includes("COORDINATOR");

  // Save schedule and refresh
  const handleSaveSchedule = async (sched: SectionSchedule) => {
    if(!section)return;
    const id = section.sectionDetails!.sectionId!;
    if (sched.day) {
      await fetchUpdateSectionSchedule(id, sched);
    } else {
      await fetchAddSectionSchedule(id, sched);
    }
    const updated = await fetchSection(id);
    setSection(updated ??{});
  };

  // Toggle into profile edit
  const startProfileEdit = () => setIsEditingProfile(true);
  const cancelProfileEdit = () => setIsEditingProfile(false);

  return (
    <div className="relative">
      {section && isEditingProfile ? (
        <EditSectionProfileSection
          sectionId={section.sectionDetails?.id ?? -1}
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
