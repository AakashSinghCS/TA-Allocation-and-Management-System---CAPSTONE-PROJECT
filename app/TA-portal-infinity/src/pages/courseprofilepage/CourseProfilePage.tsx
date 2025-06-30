import { useParams } from "react-router-dom";
import SectionProfileDetailsSection from "../../components/features/section/sectionprofiledetailssection/SectionProfileDetailsSection";
import { sectionFieldLabels, sectionProfileFields } from "../../interfaces/section/Section";
import { mockSectionCOSC111, mockSectionCOSC111Profile } from "../../mocked-objects/section/mockSectionCOSC111";
import { useEffect } from "react";
import { GenericAPIContainer } from "../../utility/genericapicontainer/GenericAPIContainer";
import { fetchSection } from "../../api/section/fetchSection";
import type Section from "../../interfaces/section/Section";


export default function CourseProfilePage() {
    const { sectionId } = useParams<{ sectionId: string }>();
    const { courseId } = useParams<{ courseId: string }>();
    const isCourse = courseId ? true : false;

    // useEffect(()=>{
    //     console.log(sectionId);
    //     console.log(courseId);
    // },[])

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
                
            </div>
        );
    }
}