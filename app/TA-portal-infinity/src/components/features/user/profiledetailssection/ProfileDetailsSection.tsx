import { useEffect, useState } from "react";
import ProfileSection from "../profilesection/ProfileSection";
import EditProfileSection from "../editprofilesection/EditProfileSection";
import { fetchUpdateUserDetails } from "../../../../api/user/fetchUpdateUserDetails";
import type User from "../../../../interfaces/user/User";
import { useAuth } from "../../../../context/AuthContext";
import type { UserRole } from "../../../../interfaces/enum/UserRole";
import TabNav from "../../../layout/tabnav/TabNav";
import ChangeRolesModal from "../changerolemodal/ChangeRolesModal";
import { fetchChangeRole } from "../../../../api/admin/fetchChangeRole";


interface Props<T extends User> {
    user: T;
    fields: (keyof T)[];
    labels: Record<keyof T, string>;
    fetchDetailsFunction: <T>(userId: number) => Promise<T>;
}

export default function ProfileDetailsSection<T extends User>({
    user,
    fields,
    labels,
    fetchDetailsFunction
}: Props<T>) {
    const { userId: loggedInUserId, userRoles: loggedInUserRoles } = useAuth();
    const [record, setRecord] = useState<T>(user);
    const [isEdit, setIsEdit] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const isAdmin = loggedInUserRoles.includes("ADMIN");

    useEffect(() => setRecord(user), [user]);

    const baseFields = fields.filter((k) => k !== "createdAt");
    const displayFields = filterFieldsByRole(baseFields, record.roles ?? []);

    const editFields = [
        "firstName" as keyof T,
        "lastName" as keyof T,
        ...displayFields.filter(k => k !== "roles"),
    ];

    const isEditable = loggedInUserId === record.id;

    return (
        <div>
            <TabNav roles={record.roles ?? []} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                <div className="lg:col-span-1 max-h-[40vh]">
                    <div className="relative">
                        {!isEdit ? (
                            <>
                                <ProfileSection
                                    user={record}
                                    profileFields={displayFields}
                                    fieldLabels={labels}
                                    big
                                />
                                {isEditable &&(<button
                                    className="absolute top-2 right-2 bg-[#040941] text-white px-2 py-1 rounded hover:bg-[#040491] transition-colors"
                                    onClick={() => setIsEdit(true)}
                                >
                                    Update
                                </button>
                                )}
                                {isAdmin && (
                                  <button
                                    className="absolute top-12 right-2 bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors"
                                    onClick={() => setShowRoleModal(true)}
                                  >
                                    Change Roles
                                  </button>
                                )} 
                            </>
                        ) : (
                            <EditProfileSection<T>
                                user={record}
                                fields={editFields}
                                labels={labels}
                                onSave={async (updates) => {
                                    if (!record.id) return;
                                    const updateResult = await fetchUpdateUserDetails<T>(record.id, updates, loggedInUserId, loggedInUserRoles);

                                    if (updateResult !== "User updated") {
                                        console.error("Unexpected update response:", updateResult);
                                        return;
                                    }
                                    if (updateResult === "User updated") {
                                        alert("Profile details updated!");
                                    }
                                    const fresh = await fetchDetailsFunction<T>(record.id);

                                    setRecord(fresh);
                                    setIsEdit(false);
                                }}
                                onCancel={() => setIsEdit(false)}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-2 max-h-[40vh]">
                    </div>
                </div>
            </div>
                        {showRoleModal && (
              <ChangeRolesModal
                currentRoles={record.roles ?? []}
                onClose={() => setShowRoleModal(false)}
                onSave={async (newRoles) => {
                  await fetchChangeRole(record.id!, newRoles);
                  const fresh = await fetchDetailsFunction<T>(record.id!);
                  setRecord(fresh);
                  setShowRoleModal(false);
                }}
              />
            )}

        </div>
    );
}

function filterFieldsByRole<T>(baseFields: (keyof T)[], recordRoles: UserRole[]): (keyof T)[] {
    let displayFields = [...baseFields];
    if (!recordRoles.includes("INSTRUCTOR")) {
        displayFields = displayFields.filter(
            (k) => k !== ("employeeNum" as keyof T) && k !== ("dept" as keyof T)
        );
    } else if (!recordRoles.includes("STUDENT")) {
        displayFields = displayFields.filter(
            (k) =>
                k !== ("studentNum" as keyof T) &&
                k !== ("program" as keyof T) &&
                k !== ("enrollmentYear" as keyof T) &&
                k !== ("schoolYear" as keyof T)
        );
    }

    return displayFields;
}