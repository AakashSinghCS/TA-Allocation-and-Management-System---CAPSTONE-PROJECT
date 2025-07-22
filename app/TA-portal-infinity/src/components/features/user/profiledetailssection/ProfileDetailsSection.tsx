import { useEffect, useState } from "react";
import ProfileSection from "../profilesection/ProfileSection";
import EditProfileSection from "../editprofilesection/EditProfileSection";
import EditRolesForm from "../editrolesform/EditRolesForm";
import QuoteSection from "../quotesection/QuoteSection";
import { fetchUpdateUserDetails } from "../../../../api/user/fetchUpdateUserDetails";
import type User from "../../../../interfaces/user/User";
import { useAuth } from "../../../../context/AuthContext";
import { UserRole } from "../../../../interfaces/enum/UserRole";
import TabNav from "../../../layout/tabnav/TabNav";
import { fetchChangeRole } from "../../../../api/admin/fetchChangeRole";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
    const [isEditRoles, setIsEditRoles] = useState(false);
    const isCoordinatorOrAdmin = loggedInUserRoles.includes(UserRole.ADMIN) || loggedInUserRoles.includes(UserRole.COORDINATOR);
    const isAdmin = loggedInUserRoles.includes("ADMIN");

    useEffect(() => setRecord(user), [user]);

    const baseFields = fields.filter((k) => isCoordinatorOrAdmin ? k !== "createdAt" : k !== "createdAt" && k !== "id");
    const displayFields = filterFieldsByRole(baseFields, record.roles ?? []);

   const editFields = [
        "firstName" as keyof T,
        "lastName" as keyof T,
        ...displayFields.filter(
            k => k !== "roles" && k !== "id"
        ),
    ];
    const isEditable = loggedInUserId === record.id;

    return (
        <div className="ml-2 sm:ml-4">
            {/* title - Only show for single user profile view, not in coordinator multi-tab view */}
            {(!isCoordinatorOrAdmin || isEditable) && (
                <div className="mb-4 md:mb-6 px-2 sm:px-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Profile</h1>
                    <p className="text-sm sm:text-base text-gray-600">View and manage user profile information</p>
                </div>
            )}
            
            <TabNav roles={record.roles ?? []} />
            <div className={`grid gap-4 md:gap-6 mt-6 md:mt-10 ${isEdit ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 xl:grid-cols-2'}`}>
                {/* Profile Section - Always visible */}
                <div className="relative">
                    <ProfileSection
                        user={record}
                        profileFields={displayFields}
                        fieldLabels={labels}
                        big
                    />
                    {isEditable && !isEdit && !isEditRoles && (
                        <button
                            className={`absolute top-2 sm:top-4 ${isAdmin ? 'right-32 sm:right-44' : 'right-2 sm:right-4'} bg-[#040941] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-[#040941]/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2`}
                            onClick={() => setIsEdit(true)}
                        >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit Profile</span>
                            <span className="sm:hidden">Edit</span>
                        </button>
                    )}
                    {isAdmin && !isEdit && !isEditRoles && (
                        <button
                            className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#040941] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-[#040941]/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                            onClick={() => setIsEditRoles(true)}
                        >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <span className="hidden sm:inline">Manage Roles</span>
                            <span className="sm:hidden">Roles</span>
                        </button>
                    )}
                </div>

                {/* Quote Section - Visible when no forms are open */}
                {!isEdit && !isEditRoles && (
                    <QuoteSection />
                )}

                {/* Edit Form Section - Only visible when editing */}
                {isEdit && (
                    <div className="relative">
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
                                    // Show success toast message
                                    toast.success("Profile updated successfully!");
                                }
                                const fresh = await fetchDetailsFunction<T>(record.id);

                                setRecord(fresh);
                                setIsEdit(false);
                            }}
                            onCancel={() => setIsEdit(false)}
                        />
                    </div>
                )}

                {/* Edit Roles Section - Only visible when editing roles */}
                {isEditRoles && (
                    <div className="relative">
                        <EditRolesForm
                            currentRoles={record.roles ?? []}
                            onSave={async (newRoles: UserRole[]) => {
                                await fetchChangeRole(record.id!, newRoles);
                                
                                // Show success toast message
                                toast.success("Roles updated successfully!");
                                
                                const fresh = await fetchDetailsFunction<T>(record.id!);
                                setRecord(fresh);
                                setIsEditRoles(false);
                            }}
                            onCancel={() => setIsEditRoles(false)}
                        />
                    </div>
                )}
            </div>
            {/* Toast Container for this component */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}
function filterFieldsByRole<T>(baseFields: (keyof T)[], recordRoles: UserRole[]): (keyof T)[] {
    let displayFields = [...baseFields];
    // Remove instructor-specific fields for non-instructors
    if (!recordRoles.includes("INSTRUCTOR")) {
        displayFields = displayFields.filter(
            (k) => k !== ("employeeNum" as keyof T) && k !== ("dept" as keyof T)
        );
    }
    // Remove student-specific fields for non-students
    if (!recordRoles.includes("STUDENT")) {
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