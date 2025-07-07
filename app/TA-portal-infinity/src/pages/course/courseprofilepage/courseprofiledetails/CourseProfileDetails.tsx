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
import { confirmCourseDeletion } from "../../../../utility/confirmation/course/confirmCourseDeletion";

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
    const deleteCourse = async () =>{
        const confirm = confirmCourseDeletion();
        if(!confirm) return;
        const ok = await fetchDeleteCourse(course?.id ?? -1);
        if(ok) navigate(-1);
    }

    const onSave = async (updates: Partial<CourseProfile>) =>{
        const {ok , sanitized, errors} = validateCourseProfile(updates);
        if (!ok) {
            alert(`Please fix the following:\n• ${errors.join("\n• ")}`);
            return;
        }
        const success = await fetchUpdateCourse(course?.id ?? -1, sanitized);
        if (success) setCourse(await fetchCourse(course?.id ?? -1))
        setIsEditingProfile(false);
    }

    return (
        <div className="relative">
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
                <>
                    <CourseProfileSection
                        course={course}
                        profileFields={fields}
                        fieldLabels={labels}
                        isCoordinator={isCoordinator}
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
