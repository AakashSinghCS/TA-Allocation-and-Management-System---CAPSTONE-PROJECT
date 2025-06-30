import type { ProfileQuestion } from "../../../../interfaces/question/ProfileQuestion";

export function SingleChoice({ question, selectedId, onSelect }: {question: ProfileQuestion, selectedId: number | null, onSelect: (id: number)=>void}) {
  return (
    <fieldset className="mb-4">
      <legend>{question.description}</legend>
      {question.answers && question.answers.map(a => (
        <label key={a.id} className="flex items-center gap-2">
          <input
            type="radio"
            checked={a.id === selectedId}
            onChange={() => {
              if(a.id) return onSelect(a.id)
            }}
          />
          {a.description}
        </label>
      ))}
    </fieldset>
  );
}
