import { useParams } from "react-router-dom";
import SectionProfileDetailsSection from "../../components/features/section/sectionprofiledetailssection/SectionProfileDetailsSection";
import { sectionFieldLabels, sectionProfileFields } from "../../interfaces/section/Section";
import { GenericAPIContainer } from "../../utility/genericapicontainer/GenericAPIContainer";
import { fetchSection } from "../../api/section/fetchSection";
import type Section from "../../interfaces/section/Section";
import { fetchCourse } from "../../api/course/fetchCourse";
import { courseFieldLabels, courseProfileFields, type Course } from "../../interfaces/course/Course";
import CourseProfileDetails from "./courseprofiledetails/CourseProfileDetails";


export default function CourseProfilePage() {
    const { sectionId } = useParams<{ sectionId: string }>();
    const { courseId } = useParams<{ courseId: string }>();
    const isCourse = courseId ? true : false;

    if (!isCourse) {
        return (
            <div>
                <GenericAPIContainer<Section | null>
                    fetchFunction={() => fetchSection(Number(sectionId))}
                    render={section => <SectionProfileDetailsSection
                        section={section}
                        fields={sectionProfileFields}
                        labels={sectionFieldLabels}
                    />}
                />
            </div>
        );
    } else {
        return (
            <div>
                <GenericAPIContainer<Course | null>
                    fetchFunction={() => fetchCourse(Number(courseId))}
                    render={course => <CourseProfileDetails
                        course={course}
                        fields={courseProfileFields}
                        labels={courseFieldLabels}
                    />}
                />
            </div>
        );
    }
}