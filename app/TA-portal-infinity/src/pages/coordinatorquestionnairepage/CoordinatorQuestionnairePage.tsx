import { useState } from "react";
import { fetchAllProfileQuestions } from "../../api/question/fetchAllProfileQuestions";
import QuestionItem from "../../components/features/questionanswer/questionitem/QuestionItem";
import type { ProfileQuestion } from "../../interfaces/question/ProfileQuestion";
import { fallbackTempId, toObjectWithTempId } from "../../utility/fallbackTempId/fallbackTempId";
import { GenericAPIContainer } from "../../utility/genericapicontainer/GenericAPIContainer";


//TODO: Confirm with the coordinator first when he clicks submit! Explain the consequences of the submit. 
//That any preexisting questions that have been updated or deleted will have all students' answers deleted in the database. And students will be notified that the questions changed and they must update it again.
//In summary: updaing or deleting does a CASCADE delete on ProfileAnswers.
//TODO: CoordinatorQuestionnaire will need a seperate testing file, as it has too much functionality to not get tested.
export default function CoordinatorQuestionnaire({ initial }: { initial: ProfileQuestion[] | null }) {
    //TODO: make a toTempProfileQuestion function for decoupling and clearer code.
    const [questions, setQuestions] = useState<TempProfileQuestion[]>(
        () => toObjectWithTempId(initial) 
    );

    const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-3">
            {questions.map((currentq) => (
                <div key={currentq.id ?? (currentq as any).tempId} className="relative border-b-solid border-b-2 border-gray-200 py-2">
                    <QuestionItem
                        key={currentq.id ?? currentq.tempId}
                        initialQuestion={currentq}
                        onSaved={savedques =>
                            setQuestions(q =>
                                q.map(x =>
                                    (x.id ?? x.tempId) === (currentq.id ?? currentq.tempId) ? { ...savedques, tempId: x.tempId } : x
                                )
                            )
                        }
                        onRemoved={key =>
                            setQuestions(qs => qs.filter(x => (x.id ?? x.tempId) !== key))
                        }
                    />
                </div>
            ))}
            <div className="flex gap-4">
                <button type="button" onClick={addQuestion} className="w-full bg-[#00C774] text-white px-2 py-1 rounded hover:bg-[#1FE88D] transition-colors">
                    + Add question
                </button>

            </div>
        </div>
    );
}

export function emptyQuestion(): TempProfileQuestion {
    return {
        id: undefined,
        tempId: fallbackTempId(),                     // local key until the server returns an id
        description: "",
        type: "SINGLE",
        answers: [
            { id: undefined, description: "", type: "MC" },
            { id: undefined, description: "", type: "MC" },
        ],
    };
}

interface TempProfileQuestion extends ProfileQuestion {
    tempId: string;
}

export function CoordinatorQuestionnairePage() {
    return (
        <GenericAPIContainer<ProfileQuestion[] | null>
            fetchFunction={fetchAllProfileQuestions}
            render={initialQs => <CoordinatorQuestionnaire initial={initialQs} />}
        />
    );
}

function toProfileQuestion(t: TempProfileQuestion): ProfileQuestion {
    return {
        id: t.id,
        description: t.description,
        type: t.type,
        answers: t.answers?.map(a => ({
            id: a.id,
            description: a.description,
            type: a.type,
        }))
    };
}