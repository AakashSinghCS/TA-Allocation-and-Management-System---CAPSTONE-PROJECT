import { useParams } from "react-router-dom";
import Comparer from "./comparer/Comparer"
import StudentTabNav from "../../../components/layout/tabnav/studenttabnav/StudentTabNav";

export default function StudentComparerPage (){
    const { studentId } = useParams();
    const sId = Number(studentId);
    return(
        <div className='mx-auto space-y-6 p-4'>
            <StudentTabNav/>
            <h2 className="text-xl font-semibold mb-4">Compare Section to Profile</h2>
            <Comparer studentId={sId}
            className="flex flex-wrap lg:grid lg:grid-cols-[1fr_auto_1fr] gap-3" />
        </div>
    )
}