import { useEffect, useState } from "react";
import ProfileSection from "../profilesection/ProfileSection";
import EditProfileSection from "../editprofilesection/EditProfileSection";
import { fetchUpdateUserDetails } from "../../../../api/user/fetchUpdateUserDetails";
import type User from "../../../../interfaces/user/User";
import { useAuth } from "../../../../context/AuthContext";

interface Props<T extends User> {
    user: T;
    fields: (keyof T)[];
    labels: Record<keyof T, string>;
    fetchDetailsFunction : <T>(userId:number) => Promise<T>;
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

    useEffect(() => setRecord(user), [user]);


    const filterFields = fields.filter((k) => k !== "createdAt");
    const editFields = [
        "firstName" as keyof T,
        "lastName" as keyof T,
        ...filterFields,
    ];

    const isEditable = loggedInUserId === record.id || loggedInUserRoles.includes("COORDINATOR");

    return (
        <div className="relative">
            {!isEdit ? (
                <>
                    <ProfileSection
                        user={record}
                        profileFields={fields}
                        fieldLabels={labels}
                        big
                    />
                    {isEditable && (<button
                        className="absolute top-2 right-2 bg-[#040941] text-white px-2 py-1 rounded hover:bg-[#040491] transition-colors"
                        onClick={() => setIsEdit(true)}
                    >
                        Update
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
                        if (updateResult === "User updated"){
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
    );
}