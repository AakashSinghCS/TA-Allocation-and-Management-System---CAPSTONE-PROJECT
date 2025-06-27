import { useParams } from "react-router-dom";

import InstructorTabNav from "../../../components/layout/tabnav/instructortabnav/InstructorTabNav";
import NeedViewer from "./needviewer/NeedViewer";


export default function InstructorNeedPage (){
    const { instructorId } = useParams();
    const iId = Number(instructorId);
    return(
        <div className='mx-auto space-y-6 p-4'>
            <InstructorTabNav/>
            <h2 className="text-xl font-semibold mb-4">Needs of the instructor</h2>
            <NeedViewer instructorId={iId} />
        </div>
    )
}