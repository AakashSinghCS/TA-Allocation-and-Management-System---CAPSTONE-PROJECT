import type Qualification from "../../../../interfaces/qualification/Qualification";
import { useState } from "react";
import { fallbackTempId, toObjectWithTempId } from "../../../../utility/fallbackTempId/fallbackTempId";
import type { Course } from "../../../../interfaces/course/Course";
import { fetchCreateQualification } from "../../../../api/instructor/fetchCreateQualification";
import { fetchDeleteQualification } from "../../../../api/instructor/fetchDeleteQualification";
import { confirmDeletion } from "../../../../utility/confirmation/confirmDeletion";
import { toast } from "react-toastify";

interface QualificationCardProps {
    initialQualifications?: Qualification[];
    course : Course;
    className?: string;
    authenticated? : boolean
    deadlinePassed : Boolean;
}

interface TempQualification extends Qualification {
    tempId: string;
}


  
export default function InstructorQualificationCard({ initialQualifications, course, deadlinePassed,  className = "", authenticated = false}: QualificationCardProps) {
    if (!initialQualifications)
        return (
            <div className="p-2 italic text-slate-400 border border-dashed border-slate-200 rounded-lg">
                No data
            </div>
        );
    const [qualifications, setQualifications] = useState<TempQualification[]>(() =>
        toObjectWithTempId(initialQualifications)
    );

    const addEditingRow = () => setQualifications(qua => [...qua, emptyQualification(course.deptCode ?? "")]);

     const onSaved = async (savedTempId : string, description: string) => {
        //TODO: ensure backend considers -1 and "" value and throw the request if they are empty.
        if (deadlinePassed) {
          toast.error("The deadline has passed. You can no longer save.");
          return;
        }
        const created : Qualification | null= await fetchCreateQualification( description, course.deptCode ?? "", course.id ?? -1);
        if (created) {
        setQualifications((q) =>
            q.map((x) => x.tempId === savedTempId ? { ...created, tempId:savedTempId } : x));}
    };

    const onRemoved = async (removingq: TempQualification) => {
      if (deadlinePassed) {
        toast.error("The deadline has passed. You can no longer delete.");
        return;
      }
        if (removingq.id) {
            const confirmed = confirmDeletion("Lab skill","");
            if(!confirmed) return;
            const ok = await fetchDeleteQualification(removingq.id);
    
            if (!ok) return;

            setQualifications(q => q.filter(x => {
                if(x.id) return x.id !== removingq.id
                return x.tempId !== removingq.tempId
            }))
        
        } 
            setQualifications(q => q.filter(x => {
                if(x.id) return x.id !== removingq.id
                return x.tempId !== removingq.tempId
            })) 
        
    }
    return (
    <div
      className={`${className} w-full border rounded-md border-gray-300 bg-amber-50 p-2`}
      data-testid="qualification-card"
    >
      <h3 className="font-medium mb-2 text-sm">Qualifications</h3>

      {qualifications.map((q) => (
        <QualificationRow
          key={q.tempId}
          qualification={q}
          isEdit={!q.id}
          onSaved={onSaved}
          onRemoved={onRemoved}
          authenticated={authenticated}
        />
      ))}

      {authenticated && <button
        onClick={addEditingRow}
        className="mt-2 italic text-slate-400 border border-dashed border-slate-200 p-2 rounded hover:bg-slate-100 w-full"
      >
        + Add a qualification
      </button>}
    </div>
  );
}

interface QualificationRowProps {
    isEdit: boolean;
    qualification: TempQualification;
    onSaved: (tempId : string, description : string) => void;
    onRemoved: (removedq: TempQualification) => void;
    authenticated : boolean
}

function QualificationRow({ isEdit = false, qualification, onSaved, onRemoved, authenticated=false }: QualificationRowProps) {
    const [description, setDescription] = useState<string>(qualification.description ?? "");

    const handleSave = () => {
        onSaved(qualification.tempId, description.trim());
    };

    return (
    <div className="flex items-stretch space-x-2 text-sm 2xl:text-base mb-2">
      {isEdit ? (
        <>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter qualification"
            className="flex-1 border border-gray-300 px-2 py-1 rounded"/>
          <button onClick={handleSave} className="px-3 py-1bg-amber-300 rounded hover:bg-amber-400">
            Save
          </button>
          <button onClick={() =>  onRemoved(qualification)} className="text-lg text-red-600 hover:text-red-300">
            ✕
          </button>
        </>
      ) : (
        <>
          <input type="checkbox" checked disabled className="w-4 h-4" />
          <span className="flex-1 ">{qualification.description}</span>
          {authenticated &&<button onClick={() => onRemoved(qualification)} className="text-red-600 text-xs 2xl:text-sm hover:text-red-300" >
            Delete
          </button> }
          
        </>
      )}
    </div>
  );
}

function emptyQualification(deptCode: string): TempQualification {
    return {
        id: undefined,
        tempId: fallbackTempId(),
        description: "",
        deptCode: deptCode
    }
}


