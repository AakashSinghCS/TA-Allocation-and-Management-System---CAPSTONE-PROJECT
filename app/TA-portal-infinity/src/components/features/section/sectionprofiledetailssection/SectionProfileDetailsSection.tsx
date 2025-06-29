import { useEffect, useState } from "react";
import EditSectionProfileSection from "../edtionsectionprofilesection/EditSectionProfileSection";
import type { SectionProfile } from "../../../../interfaces/section/Section";
import { fetchUpdateUserDetails } from "../../../../api/student/fetchUpdateUserDetails";
import { useAuth } from "../../../../context/AuthContext";
import SectionProfileSection from "../sectionprofilesection/SectionProfileSection";

interface Props {
  section: SectionProfile;
  fields: (keyof SectionProfile)[];
  labels: Record<keyof SectionProfile, string>;
  fetchDetailsFunction?: (sectionId: number) => Promise<SectionProfile>;
}

export default function SectionProfileDetailsSection({
  section: initial,
  fields,
  labels,
  fetchDetailsFunction,
}: Props) {
  const { userRoles } = useAuth();
  const [section, setSection] = useState(initial);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    setSection(initial);
  }, [initial]);

  const isEditable = userRoles.includes("COORDINATOR");

  return (
    <div className="relative">
      {!isEdit ? (
        <>
          <SectionProfileSection
            section={section}
            profileFields={fields}
            fieldLabels={labels}
            big
            isCourse={false}
          />
          {isEditable && (
            <button
              className="absolute top-2 right-2 bg-[#040941] text-white px-2 py-1 rounded hover:bg-[#040491] transition-colors"
              onClick={() => setIsEdit(true)}
            >
              Update
            </button>
          )}
        </>
      ) : (

        <EditSectionProfileSection
          section={section}
          fields={fields}
          labels={labels}
          onSave={async (updates) => {
            
          }}
          onCancel={() => setIsEdit(false)}
        />
      )}
    </div>
  );
}
