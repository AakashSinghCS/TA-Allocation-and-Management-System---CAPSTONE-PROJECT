import { useState } from "react";
import { fetchAllProfileQuestions } from "../../../api/question/fetchAllProfileQuestions";
import QuestionItem from "../../../components/features/questionanswer/questionitem/QuestionItem";
import type { ProfileQuestion } from "../../../interfaces/question/ProfileQuestion";
import { fallbackTempId, toObjectWithTempId } from "../../../utility/fallbackTempId/fallbackTempId";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
import { TriangleAlert ,  Plus} from 'lucide-react';

//TODO: Confirm with the coordinator first when he clicks submit! Explain the consequences of the submit. 
//That any preexisting questions that have been updated or deleted will have all students' answers deleted in the database. And students will be notified that the questions changed and they must update it again.
//In summary: updaing or deleting does a CASCADE delete on ProfileAnswers.
//TODO: CoordinatorQuestionnaire will need a seperate testing file, as it has too much functionality to not get tested.
export function CoordinatorQuestionnaire({ initial }: { initial: ProfileQuestion[] | null }) {
    //TODO: make a toTempProfileQuestion function for decoupling and clearer code.
    const [questions, setQuestions] = useState<TempProfileQuestion[]>(
        () => toObjectWithTempId(initial)
    );

    const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* Header Section */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#040941]">Profile Questionnaire Management</h1>
                            <p className="text-gray-600 mt-2 text-sm md:text-base">Manage the questions that students must answer for their profiles</p>
                        </div>
                        <div className="text-right lg:text-center">
                            <div className="text-xl md:text-2xl font-bold text-[#040941]">{questions.length}</div>
                            <div className="text-xs md:text-sm text-gray-500">Total Questions</div>
                        </div>
                    </div>
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-3 md:p-4 flex items-start md:items-center mb-2">
                        <div className="flex-shrink-0 mr-3 md:mr-4">
                            <TriangleAlert className="w-6 h-6 md:w-7 md:h-7 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap justify-between items-start md:items-center w-full">
                                <div>
                                    <span className="font-semibold text-amber-900 text-base md:text-lg">Profile Question Changes</span>
                                    <div className="text-amber-900 text-xs md:text-sm mt-1">Updating or deleting questions will <strong>permanently delete all student responses</strong>. Changes affect all students immediately.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Grid */}
                <div className="space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Questions Management</h2>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="bg-[#040941] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1E2A78] transition-colors shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            Add New Question
                        </button>
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                        {questions.map((currentq, index) => (
                            <div key={currentq.id ?? (currentq as any).tempId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                                <QuestionItem
                                    key={currentq.id ?? currentq.tempId}
                                    initialQuestion={currentq}
                                    questionNumber={index + 1}
                                    hideQuestionText={false}
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
                    </div>
                </div>
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

export default function CoordinatorQuestionnairePage() {
    return (
        <GenericAPIContainer<ProfileQuestion[] | null>
            fetchFunction={fetchAllProfileQuestions}
            render={initialQs => <CoordinatorQuestionnaire initial={initialQs} />}
        />
    );
}