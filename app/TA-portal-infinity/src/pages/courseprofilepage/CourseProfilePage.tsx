import { useParams } from "react-router-dom";
import SectionProfileDetailsSection from "../../components/features/section/sectionprofiledetailssection/SectionProfileDetailsSection";
import { sectionFieldLabels, sectionProfileFields } from "../../interfaces/section/Section";
import { mockSectionCOSC111, mockSectionCOSC111Profile } from "../../mocked-objects/section/mockSectionCOSC111";
import { useEffect } from "react";


export default function CourseProfilePage (){
    const { sectionId } = useParams<{ sectionId: string }>();
    const { courseId } = useParams<{ courseId: string }>();
    const isCourse = courseId?true:false;

    // useEffect(()=>{
    //     console.log(sectionId);
    //     console.log(courseId);
    // },[])

    if(!isCourse){
        return(
            <div>
                <SectionProfileDetailsSection 
                    section={mockSectionCOSC111}
                    fields = {sectionProfileFields}
                    labels = {sectionFieldLabels}
                />
            </div>
        );
    }else{
        return(
            <div>

            </div>
        );
    }
}