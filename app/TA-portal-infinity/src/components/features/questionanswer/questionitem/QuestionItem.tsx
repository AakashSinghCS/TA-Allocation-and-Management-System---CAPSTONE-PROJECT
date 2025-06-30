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
}

export default function QuestionItem({ initialQuestion, onRemoved, onSaved, responseValue, onChange }: QuestionItemProps) {
  const isCoordinatorOrAdmin = useAuth().userRoles.includes("COORDINATOR") ||  useAuth().userRoles.includes("ADMIN");
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
      saved = await fetchUpdateQuestion(toRequest(question));
    } else {
      saved = await fetchCreateQuestion(toRequest(question));
    }
    if (!saved) {
      alert("Could not save – please try again");
      return;
    }

    setQuestion(saved);
    setEditing(false);
    onSaved?.(saved);
  };

  const handleDelete = async () => {
    if (question.id != null) {
      const success = await fetchDeleteQuestion(question.id);
      if (success) {
        alert("Question deleted successfully");
        onRemoved?.(
          initialQuestion.id ?? (initialQuestion as any).tempId
        );
      } else {
        alert("Failed to delete question. Please try again.");
      }
    } else {
      onRemoved?.((initialQuestion as any).tempId);
    }
  };

  if (editing) {
    return (
      <fieldset className="mb-6 border p-4 rounded-lg border-gray-400">
        <label className="block mb-2">
          Question text
          <input value={question.description} onChange={e => patch({ description: e.target.value })} className="w-full border px-2 py-1 mt-1"/>
        </label>

        <label className="block mb-4">
          Type:{" "}
          <select value={question.type} onChange={e => patch({ type: e.target.value as ProfileQuestion["type"] })}>
            <option value="SINGLE">Single choice</option>
            <option value="MULTI">Multiple choice</option>
            <option value="FREE_TEXT">Free-text</option>
          </select>
        </label>

        {question.type && ["SINGLE", "MULTI"].includes(question.type) && (
          <AnswerListEditor
            answers={question.answers ?? []}
            onChange={ans => patch({ answers: ans })}
          />
        )}
        {/* Todo: use useAuth to check if user is coord rather than using onRemoved && */}
        {onRemoved &&
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={handleSave} className="bg-[#00C774] text-white px-2 py-1 rounded hover:bg-[#1FE88D] transition-colors">
              Save
            </button>
            <button type="button" onClick={() => {
                if (initialQuestion.id == null) {
                  // canceling a brand-new question
                  onRemoved((initialQuestion as any).tempId);
                } else {
                  // revert edits
                  setQuestion(initialQuestion);
                  setEditing(false);
                }
              }}
              className="py-1 px-2 rounded hover:bg-red-100 transition-colors" >
              Cancel
            </button>
            <button type="button" onClick={handleDelete} className="py-1 px-2 rounded hover:bg-red-100 transition-colors">
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

  switch (question.type) {
    case "SINGLE":
      return (
        <div>
          <SingleChoice question={question} selectedId={(base.answerIds ?? [])[0] ?? null} 
            onSelect={id => change({ questionId: question.id, answerIds: [id] })}/>
          {isCoordinatorOrAdmin && <button
            onClick={() => setEditing(true)}
            className="text-sm px-2 py-1 border rounded"
          >
            Edit
          </button>}
        </div>
      );

    case "MULTI":
      return (
        <div>
          <MultipleChoice question={question} selected={base.answerIds ?? []} onToggle={(id, checked) => {
              const current = base.answerIds ?? [];
              const next = checked
                ? [...current, id]
                : current.filter(x => x !== id);
              change({ questionId: question.id, answerIds: next });
            }}/>
          {isCoordinatorOrAdmin &&<button onClick={() => setEditing(true)} className="text-sm px-2 py-1 border rounded">
            Edit
          </button>}
        </div>
      );

    case "FREE_TEXT":
      return (
        <div>
          <FreeText question={question} text={base.answerText ?? ""} onChange={txt => change({ questionId: question.id, answerText: txt })}/>
          {isCoordinatorOrAdmin && <button onClick={() => setEditing(true)} className="text-sm px-2 py-1 border rounded" >
            Edit
          </button>}
        </div>
      );

    default:
      return null;
  }
}

function AnswerListEditor({ answers, onChange, }: { answers: ProfileAnswer[]; onChange: (answers: ProfileAnswer[]) => void; }) {
  const updateAnswer = (idx: number, partial: Partial<ProfileAnswer>) => {
    const next = answers.map((ans, i) =>
      i === idx ? { ...ans, ...partial } : ans
    );
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {answers.map((a, i) => (
        <div key={a.id ?? i} className="flex gap-2">
          <input
            className="flex-1"
            value={a.description ?? ""}
            placeholder={`Option ${i + 1}`}
            onChange={e => updateAnswer(i, { description: e.target.value })}
          />
          <button
            type="button"
            title="Delete"
            onClick={() => onChange(answers.filter((_, j) => j !== i))}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        className="mt-2 text-[#040941] px-2 py-1 rounded hover:text-[#040491] transition-colors"
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
