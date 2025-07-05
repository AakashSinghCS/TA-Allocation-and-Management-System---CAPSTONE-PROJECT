import { useParams } from "react-router-dom";
import InstructorTabNav from "../../../../components/layout/tabnav/instructortabnav/InstructorTabNav";
import InstructorQualificationViewer from "./qualificationviewer/InstructorQualificationViewer";

export default function InstructorQualificationPage (){
    const { instructorId } = useParams();
    const iId = Number(instructorId);
    return(
        <div className='mx-auto space-y-6 p-4'>
            <InstructorTabNav/>
            <h2 className="text-xl font-semibold mb-4">Instructor's required lab skills (qualifications)</h2>
            <p className="text-xs text-slate-600">The qualifications you see below is a list accumulated by previous instructors.
                 Deleting or adding a qualification will <span className="italic text-red-400">permanently </span> 
                  delete or add a qualification to all future and ongoing courses.</p>
            <InstructorQualificationViewer instructorId={iId} />
        </div>
    )
}