import { useParams } from "react-router-dom";
import InstructorTabNav from "../../../components/layout/tabnav/instructortabnav/InstructorTabNav";
import InstructorQualificationViewer from "./qualificationviewer/InstructorQualificationViewer";

export default function InstructorQualificationPage (){
    const { instructorId } = useParams();
    const iId = Number(instructorId);
    return(
        <div className='mx-auto space-y-6 p-4'>
            <InstructorTabNav/>
            <h2 className="text-xl font-semibold mb-4">Needs of the instructor</h2>
            <InstructorQualificationViewer instructorId={iId} />
        </div>
    )
}