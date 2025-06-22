import type Qualification from "../../../interfaces/qualification/Qualification";
import { useState } from "react";
import { fallbackTempId } from "../../../utility/fallbackTempId/fallbackTempId";

interface QualificationCardProps {
    initialQualifications?: Qualification[];
    className?: string;
}

export default function QualificationCard({ initialQualifications, className = "" }: QualificationCardProps) {
    if (!initialQualifications)
        return (
            <div className="p-2 italic text-slate-400 border border-dashed border-slate-200 rounded-lg">
                No data
            </div>
        );
    const [qualifications, setQualifications] = useState<Qualification[]>(initialQualifications);
    
    const addEditingRow = () => setQualifications(qua => [...qua, emptyQualification(qualifications[0].deptCode ?? "")]);

    return (
        <div className={className + " w-full overflow-hidden rounded-lg text-sm border border-amber-300 bg-amber-50 p-2"} data-testid="qualification-card" >
            {
                qualifications.map((q, i) => (
                    <label>
                        <select value="MULTI">
                            <QualificationRow qualification={q} isEdit={false} 
                                onSaved={savedqual }
                            />
                        </select>
                    </label>
                ))
            }
            <button
                className="cursor-hover p-2 italic text-slate-400 border border-slate-400 rounded-lg"
                onClick={addEditingRow}>
                Add a qualification
            </button>
        </div>
    );
}

interface QualificationRowProps {
    isEdit: boolean;
    qualification: Qualification;
    onSaved: (savedqual : Qualification)=> void;
    onRemoved: (idOrTemp : number |string )=> void;
}

function QualificationRow({ isEdit = false, qualification, onSaved, onRemoved }: QualificationRowProps) {
    const [description, setDescription] = useState<string>(qualification.description ?? "");

    const onDelete = () => {
        if (qualification.id) {
            //fetchDelete here
        }
    }

    if (!isEdit) {
        return (
            <>
                <div className="">
                    <input className="flex-1 border px-2 py-1" value={""} placeholder="add your description here"
                        onChange={(e) => setDescription(e.target.value)} />
                    <button type="button" title="Delete" onClick={() => onDelete()}>
                        ✕
                    </button>
                </div>
            </>
        );
    }
    return (
        <option>
            {description}
        </option>
    );
}

function emptyQualification(deptCode : string) : TempQualification{
    return {
        id: undefined,
        tempId: fallbackTempId(),
        description: "",
        deptCode: deptCode
    }
}


interface TempQualification extends Qualification {
    tempId: string;
}
