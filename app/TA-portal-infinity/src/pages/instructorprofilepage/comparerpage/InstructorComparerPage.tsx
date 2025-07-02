import { useParams } from "react-router-dom";
import Comparer from "./comparer/Comparer";
import InstructorTabNav from "../../../components/layout/tabnav/instructortabnav/InstructorTabNav";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
import { fetchAllSectionsAndNeedAndAllocations } from "../../../api/instructor/fetchAllSectionsAndNeedAndAllocations";
import type Section from "../../../interfaces/section/Section";


export default function InstructorComparerPage (){
    const { instructorId } = useParams();
    const iId = Number(instructorId);
    return(
        <div className='mx-auto space-y-6 p-4'>
            <InstructorTabNav/>
            <h2 className="text-xl font-semibold mb-4">Compare a TA to a section the instructor teaches</h2>
            <p className="text-xs text-slate-600">If the instructor has specified the course prerequisites for each section he is teaching,
              use this application to see which sections the instructor teaches the student fulfills course prerequisites for </p>
            <GenericAPIContainer<Section[] | null>
                      fetchFunction={() => fetchAllSectionsAndNeedAndAllocations(iId)}
                      render={sections => (
                        <Comparer
                          sections={sections ?? []}
                          className="flex flex-wrap lg:grid lg:grid-cols-[1fr_auto_1fr] gap-3"
                        />
                      )}
                    />
        </div>
    )
}