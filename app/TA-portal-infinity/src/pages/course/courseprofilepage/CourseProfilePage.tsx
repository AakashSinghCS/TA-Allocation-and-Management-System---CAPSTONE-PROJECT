import { useParams } from "react-router-dom";
import SectionProfileDetailsSection from "../section/sectionprofiledetailssection/SectionProfileDetailsSection";
import { sectionFieldLabels, sectionProfileFields } from "../../../interfaces/section/Section";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
import type Section from "../../../interfaces/section/Section";
import { fetchCourse } from "../../../api/course/fetchCourse";
import { courseFieldLabels, courseProfileFields, type Course } from "../../../interfaces/course/Course";
import CourseProfileDetails from "./courseprofiledetails/CourseProfileDetails";
import  {fetchSectionIncludeInstructorId}  from "../../../api/section/fetchSectionIncludeInstructorId";


export default function CourseProfilePage() {
    const { sectionId } = useParams<{ sectionId: string }>();
    const { courseId } = useParams<{ courseId: string }>();
    const isCourse = courseId ? true : false;

    if (!isCourse) {
        return (
            <div className="min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <GenericAPIContainer<Section | null>
                        fetchFunction={() => fetchSectionIncludeInstructorId(Number(sectionId))}
                        render={section => <SectionProfileDetailsSection
                            section={section}
                            fields={sectionProfileFields}
                            labels={sectionFieldLabels}
                        />}
                    />
                </div>
            </div>
        );
    } else {
        return (
            <div className="min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <GenericAPIContainer<Course | null>
                        fetchFunction={() => fetchCourse(Number(courseId))}
                        render={course => <CourseProfileDetails
                            course={course}
                            fields={courseProfileFields}
                            labels={courseFieldLabels}
                        />}
                    />
                </div>
            </div>
        );
    }
}