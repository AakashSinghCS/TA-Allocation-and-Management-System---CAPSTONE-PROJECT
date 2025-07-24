import type Qualification from "../../../../interfaces/qualification/Qualification";
import { useState } from "react";
import { fallbackTempId, toObjectWithTempId } from "../../../../utility/fallbackTempId/fallbackTempId";
import type { Course } from "../../../../interfaces/course/Course";
import { fetchCreateQualification } from "../../../../api/instructor/fetchCreateQualification";
import { fetchDeleteQualification } from "../../../../api/instructor/fetchDeleteQualification";
import { showToastConfirmation, showToastSuccess, showToastError } from "../../../../utility/confirmation/toastConfirmation";

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
          showToastError("The deadline has passed. You can no longer save.");
          return;
        }
        
        try {
          const created : Qualification | null= await fetchCreateQualification( description, course.deptCode ?? "", course.id ?? -1);
          if (created) {
            setQualifications((q) =>
              q.map((x) => x.tempId === savedTempId ? { ...created, tempId:savedTempId } : x));
            showToastSuccess("Qualification added successfully!");
          }
        } catch (error) {
          showToastError("Failed to add qualification. Please try again.");
          console.error("Error creating qualification:", error);
        }
    };

    const onRemoved = async (removingq: TempQualification) => {
      if (deadlinePassed) {
        showToastError("The deadline has passed. You can no longer delete.");
        return;
      }
      
      if (removingq.id) {
        try {
          const confirmed = await showToastConfirmation({
            title: "Delete Lab Skill",
            message: `Are you sure you want to delete "${removingq.description}"? This will permanently remove this qualification from all future and ongoing courses.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger"
          });
          
          if (!confirmed) return;
          
          console.log("Attempting to delete qualification with ID:", removingq.id);
          const ok = await fetchDeleteQualification(removingq.id);
          console.log("Delete API response:", ok);
          
          if (ok) {
            setQualifications(q => q.filter(x => {
              if(x.id) return x.id !== removingq.id;
              return x.tempId !== removingq.tempId;
            }));
            showToastSuccess("Qualification deleted successfully!");
          } else {
            showToastError("Failed to delete qualification. Server returned an error.");
          }
        } catch (error) {
          console.error("Error deleting qualification:", error);
          showToastError("Failed to delete qualification. Please check your network connection and try again.");
        }
      } else {
        // For unsaved qualifications, just remove from state
        setQualifications(q => q.filter(x => x.tempId !== removingq.tempId));
        showToastSuccess("Unsaved qualification removed.");
      }
    }
    return (
    <div
      className={`${className} w-full border border-gray-200 rounded-lg bg-white p-4`}
      data-testid="qualification-card"
    >
      <h3 className="font-semibold text-base text-[#040941] mb-4">Required Lab Skills</h3>

      {qualifications.length === 0 && !authenticated ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-sm">No qualifications defined for this course yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
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
        </div>
      )}

      {authenticated && (
        <button
          onClick={addEditingRow}
          className="mt-3 text-sm text-[#0089b2] hover:text-[#007299] font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add a qualification
        </button>
      )}
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
        if (description.trim()) {
            onSaved(qualification.tempId, description.trim());
        } else {
            showToastError("Please enter a qualification description.");
        }
    };

    const handleRemove = () => {
        console.log("Remove button clicked for qualification:", qualification);
        onRemoved(qualification);
    };

    return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
      {isEdit ? (
        <>
          <input 
            type="text" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter qualification (e.g., Python programming, Data analysis)"
            className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-[#0089b2] focus:border-[#0089b2] outline-none"
          />
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-[#0089b2] text-white rounded-md hover:bg-[#007299] transition-colors text-sm font-medium"
          >
            Save
          </button>
          <button 
            onClick={handleRemove} 
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            title="Cancel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm text-gray-700">• {qualification.description}</span>
          </div>
          {authenticated && (
            <button 
              onClick={handleRemove} 
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Delete qualification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          )}
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


