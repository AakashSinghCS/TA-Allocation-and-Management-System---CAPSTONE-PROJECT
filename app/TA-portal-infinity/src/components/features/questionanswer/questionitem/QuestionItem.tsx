import { useCallback, useState } from "react";
import type { ProfileQuestion } from "../../../../interfaces/question/ProfileQuestion";
import { SingleChoice } from "../singlechoice/SingleChoice";
import { MultipleChoice } from "../multiplechoice/MultipleChoice";
import { FreeText } from "../freetext/FreeText";
import type { AnswerType, ProfileAnswer } from "../../../../interfaces/question/ProfileAnswer";
import { fetchDeleteQuestion } from "../../../../api/question/fetchDeleteQuestion";
import { fetchCreateQuestion } from "../../../../api/question/fetchCreateQuestion";
import { fetchUpdateQuestion } from "../../../../api/question/fetchUpdateQuestion";
import { useAuth } from "../../../../context/AuthContext";
import { showToastConfirmation } from "../../../../utility/confirmation/toastConfirmation";
import { toast } from "react-toastify";

export type QuestionnaireMode = "respond" | "edit";

export interface QuestionRequest {
  id?: number;
  description?: string;
  type?: "SINGLE" | "MULTI" | "FREE_TEXT";
  answers?: { id?: number; description: string; type: AnswerType | null; }[];
}

export interface StudentResponseDto {
  questionId?: number;
  answerIds?: number[];
  answerText?: string | null;
}

interface QuestionItemProps {
  initialQuestion: ProfileQuestion;
  responseValue?: StudentResponseDto | undefined;
  onChange?: (resp: StudentResponseDto) => void;
  onRemoved?: (idOrTemp: number | string) => void;
  onSaved?: (saved: ProfileQuestion) => void;
  hideQuestionText?: boolean;
  questionNumber?: number;
}

export default function QuestionItem({ initialQuestion, onRemoved, onSaved, responseValue, onChange, hideQuestionText = false, questionNumber }: QuestionItemProps) {
  const isCoordinatorOrAdmin = useAuth().userRoles.includes("COORDINATOR") || useAuth().userRoles.includes("ADMIN");
  const [editing, setEditing] = useState(initialQuestion.id == null);
  const [question, setQuestion] = useState<ProfileQuestion>(initialQuestion);

  const patch = useCallback(
    (partial: Partial<ProfileQuestion>) => setQuestion(old => ({ ...old, ...partial })),
    []
  );

  const toRequest = (qq: ProfileQuestion): QuestionRequest => ({
    id: qq.id,
    description: qq.description ?? "",
    type: qq.type,
    answers: (qq.answers ?? []).map(a => ({
      ...(a.id !== undefined ? { id: a.id } : {}),
      description: a.description ?? "",
      type: a.type ?? null
    })),
  });

  const handleSave = async () => {
    let saved: ProfileQuestion | null;
    if (question.id != null) {
      const confirm = await showToastConfirmation({
        title: "Update Question",
        message: "This will DELETE all previous students' responses to the question!",
        type: "warning",
      });
      if (!confirm) return;
      saved = await fetchUpdateQuestion(toRequest(question));
    } else {
      saved = await fetchCreateQuestion(toRequest(question));
    }
    if (!saved) {
      toast.error("Could not save – please try again");
      return;
    }

    setQuestion(saved);
    setEditing(false);
    onSaved?.(saved);
  };

  const handleDelete = async () => {
    if (question.id != null) {
      const confirm = await showToastConfirmation({
        title: "Delete Question",
        message: "This will delete all students' responses to the question",
        type: "danger",
      });
      if (!confirm) return;
      const success = await fetchDeleteQuestion(question.id);
      if (success) {
        toast.success("Question deleted successfully");
        onRemoved?.(
          initialQuestion.id ?? (initialQuestion as any).tempId
        );
      } else {
        toast.error("Failed to delete question. Please try again.");
      }
    } else {
      onRemoved?.((initialQuestion as any).tempId);
    }
  };

  if (editing) {
    return (
      <fieldset className="mb-4 md:mb-6 border border-gray-300 bg-white p-4 md:p-6 rounded-xl shadow flex flex-col gap-4">
        <label className="block text-base font-semibold text-[#040941]">
          Question text
          <input value={question.description} onChange={e => patch({ description: e.target.value })} className="w-full border border-gray-300 px-3 py-1 mt-2 rounded focus:outline-none focus:ring-2 focus:ring-[#040941]"/>
        </label>

        <label className="block">
          <span className="font-medium">Type:</span>{" "}
          <select value={question.type} onChange={e => patch({ type: e.target.value as ProfileQuestion["type"] })} className="ml-2 border border-gray-300 rounded px-1 py-1">
            <option value="SINGLE">Single choice</option>
            <option value="MULTI">Multiple choice</option>
            <option value="FREE_TEXT">Free-text</option>
          </select>
        </label>

        {question.type && ["SINGLE", "MULTI"].includes(question.type) && (
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm mb-1">Options:</span>
            <AnswerListEditor
              answers={question.answers ?? []}
              onChange={ans => patch({ answers: ans })}
            />
          </div>
        )}
        {onRemoved &&
          <div className="mt-2 flex flex-col sm:flex-row gap-2 justify-end">
            <button type="button" onClick={handleSave} className="bg-[#040941] text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors font-semibold">
              Save
            </button>
            <button type="button" onClick={() => {
                if (initialQuestion.id == null) {
                  onRemoved((initialQuestion as any).tempId);
                } else {
                  setQuestion(initialQuestion);
                  setEditing(false);
                }
              }}
              className="py-1 px-3 rounded hover:bg-red-100 transition-colors border border-gray-300" >
              Cancel
            </button>
            <button type="button" onClick={handleDelete} className="py-1 px-3 rounded hover:bg-red-100 transition-colors border border-gray-300">
              Delete
            </button>
          </div>
        }
      </fieldset>
    );
  }

  const base: StudentResponseDto = responseValue ?? {
    questionId: question.id,
    answerIds: [],
    answerText: "",
  };

  const change = onChange ? useCallback(
    (partial: Partial<StudentResponseDto>) =>
      onChange({ ...base, ...partial })
    ,
    [base, onChange]
  ) : (_: Partial<StudentResponseDto>) => { };

  // Display mode: dashboard-style with clean separation and proper alignment
  return (
    <div className="space-y-3 md:space-y-4">
      {/* Question Header with aligned Edit button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
          {questionNumber && (
            <span className="bg-[#040941] text-white text-xs px-3 py-1 rounded-full font-medium w-fit">
              {questionNumber}
            </span>
          )}
          {!hideQuestionText && (
            <h3 className="text-base md:text-lg font-semibold text-[#040941] break-words">{question.description}</h3>
          )}
        </div>
        {isCoordinatorOrAdmin && (
          <button
            onClick={() => setEditing(true)}
            className="bg-gray-100 text-gray-700 px-3 md:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Edit Question
          </button>
        )}
      </div>

      {/* Question Options */}
      <div className="pl-0 sm:pl-[calc(1rem+2rem)]">
        {question.type === "SINGLE" && (
          <SingleChoice question={question} selectedId={(base.answerIds ?? [])[0] ?? null}
            onSelect={id => change({ questionId: question.id, answerIds: [id] })} />
        )}
        {question.type === "MULTI" && (
          <MultipleChoice question={question} selected={base.answerIds ?? []} onToggle={(id, checked) => {
            const current = base.answerIds ?? [];
            const next = checked
              ? [...current, id]
              : current.filter(x => x !== id);
            change({ questionId: question.id, answerIds: next });
          }} />
        )}
        {question.type === "FREE_TEXT" && (
          <FreeText question={question} text={base.answerText ?? ""} onChange={txt => change({ questionId: question.id, answerText: txt })} />
        )}
      </div>
    </div>
  );
}

function AnswerListEditor({ answers, onChange, }: { answers: ProfileAnswer[]; onChange: (answers: ProfileAnswer[]) => void; }) {
  const updateAnswer = (idx: number, partial: Partial<ProfileAnswer>) => {
    const next = answers.map((ans, i) =>
      i === idx ? { ...ans, ...partial } : ans
    );
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      {answers.map((a, i) => (
        <div key={a.id ?? i} className="flex gap-2 items-center">
          <input
            className="flex-1 border border-gray-300 rounded px-2 md:px-3 py-1 md:py-1 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#040941] w-full"
            value={a.description ?? ""}
            placeholder={`Option ${i + 1}`}
            onChange={e => updateAnswer(i, { description: e.target.value })}
          />
          <button
            type="button"
            title="Delete"
            className="text-red-500 hover:text-red-700 px-2 py-1 rounded text-sm md:text-base flex-shrink-0"
            onClick={() => onChange(answers.filter((_, j) => j !== i))}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        className="mt-2 text-[#040941] px-1 py-1 rounded hover:text-[#040491] transition-colors border border-gray-200 w-fit text-sm md:text-base"
        onClick={() =>
          onChange([
            ...answers,
            { id: undefined, description: "", type: "MC" },
          ])
        }
      >
        + Add option
      </button>
    </div>
  );
}
