import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import EditCourseDetails from "../editcoursedetails/EditCourseDetails";
import CourseProfileSection from "./courseprofilesection/CourseProfileSection";
import type { Course, CourseProfile } from "../../../../interfaces/course/Course";
import { fetchCourse } from "../../../../api/course/fetchCourse";
import { fetchUpdateCourse } from "../../../../api/course/fetchUpdateCourse";
import { fetchDeleteCourse } from "../../../../api/course/fetchDeleteCourse";
import { useNavigate } from "react-router-dom";
import { validateCourseProfile } from "../../../../utility/validation/course/validateCourseProfile";
import { ToastContainer } from 'react-toastify';
import { showToastConfirmation, showToastSuccess, showToastError } from "../../../../utility/confirmation/toastConfirmation";


interface Props {
    course: Course | null;
    fields: (keyof CourseProfile)[];
    labels: Record<keyof CourseProfile, string>;
}

export default function CourseProfileDetails({
    course: initial,
    fields,
    labels,
}: Props) {
    const navigate = useNavigate();
    const { userRoles } = useAuth();
    const [course, setCourse] = useState<Course | null>(initial);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    useEffect(() => {
        setCourse(initial);
    }, [initial]);

    const isCoordinator = userRoles.includes("COORDINATOR");
    const startProfileEdit = () => setIsEditingProfile(true);
    const cancelProfileEdit = () => setIsEditingProfile(false);
    const deleteCourse = async () => {
        const confirmed = await showToastConfirmation({
            title: "Delete Course",
            message: "Are you sure you want to delete this course? This will delete all associated sections.",
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger"
        });
        
        if (!confirmed) return;
        
        try {
            const ok = await fetchDeleteCourse(course?.id ?? -1);
            if (ok) {
                showToastSuccess("Course deleted successfully");
                navigate(-1);
            } else {
                showToastError("Failed to delete course");
            }
        } catch (error) {
            showToastError("Failed to delete course");
        }
    }

    const onSave = async (updates: Partial<CourseProfile>) => {
        const { ok, sanitized, errors } = validateCourseProfile(updates);
        if (!ok) {
            showToastError(`Please fix the following:\n• ${errors.join("\n• ")}`);
            return;
        }
        
        try {
            const success = await fetchUpdateCourse(course?.id ?? -1, sanitized);
            if (success) {
                setCourse(await fetchCourse(course?.id ?? -1));
                showToastSuccess("Course details updated successfully");
            } else {
                showToastError("Failed to update course details");
            }
            setIsEditingProfile(false);
        } catch (error) {
            showToastError("Failed to update course details");
        }
    }

    return (        <div className="max-w-7xl mx-auto px-4 py-8 border border-gray-200 rounded-2xl bg-white shadow-sm">
            {course && isEditingProfile ? (
                <EditCourseDetails
                    courseId={course?.id ?? -1}
                    course={course}
                    fields={fields}
                    labels={labels}
                    onSave={onSave}
                    onCancel={cancelProfileEdit}
                />
            ) : (
                <div className="w-full">
                    <CourseProfileSection
                        course={course}
                        profileFields={fields}
                        fieldLabels={labels}
                        isCoordinator={isCoordinator}
                    />
                    {isCoordinator && (
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
