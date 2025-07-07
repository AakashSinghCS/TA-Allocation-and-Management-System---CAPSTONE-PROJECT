import { useParams } from "react-router-dom";
import StudentQualificationViewer from "./qualificationviewer/StudentQualificationViewer";
import StudentTabNav from "../../../../components/layout/tabnav/studenttabnav/StudentTabNav";

export default function StudentQualificationPage (){
    const { studentId } = useParams();
    const sId = Number(studentId);
    return(
        <div className='mx-auto space-y-6 p-4'>
            <StudentTabNav/>
            <h2 className="text-xl font-semibold mb-4">Students's lab skills (qualifications)</h2>
            <p className="text-xs text-slate-600">The qualifications you see below is a list ....</p>
            <StudentQualificationViewer studentId={sId} />
        </div>
    )
}