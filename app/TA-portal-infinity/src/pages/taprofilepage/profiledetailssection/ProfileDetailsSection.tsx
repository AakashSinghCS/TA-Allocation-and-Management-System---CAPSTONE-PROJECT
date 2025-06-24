import { useEffect, useState } from "react";
import ProfileSection from "../../../components/features/user/profilesection/ProfileSection";
import EditProfileSection from "../../../components/features/user/editprofilesection/EditProfileSection";
import { fetchUpdateUserDetails } from "../../../api/student/fetchUpdateUserDetails";
import type User from "../../../interfaces/user/User";
import { useAuth } from "../../../context/AuthContext";
import { fetchUserDetails } from "../../../api/student/fetchUserDetails";

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
                    <button
                        className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white rounded"
                        onClick={() => setIsEdit(true)}
                    >
                        Update
                    </button>
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