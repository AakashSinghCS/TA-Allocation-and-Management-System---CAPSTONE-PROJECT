import { useParams } from "react-router-dom";

import InstructorTabNav from "../../../components/layout/tabnav/instructortabnav/InstructorTabNav";
import NeedViewer from "./needviewer/NeedViewer";
import { fetchAllSectionsAndNeedAndAllocations } from "../../../api/instructor/fetchAllSectionsAndNeedAndAllocations";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
import type Section from "../../../interfaces/section/Section";


export default function InstructorNeedPage (){
    const { instructorId } = useParams();

    return(
        <div className='mx-auto space-y-6 p-4'>
            <InstructorTabNav/>
            <h2 className="text-xl font-semibold mb-4">Needs of the instructor</h2>
            <GenericAPIContainer<Section[] | null>
                  fetchFunction={() => fetchAllSectionsAndNeedAndAllocations(Number(instructorId))}
                  render={(sections) => (
            <NeedViewer instructorId={Number(instructorId)} initial={sections}/>
                  )}/>
        </div>
    )
}