import type { ProfileQuestion } from "../../../../interfaces/question/ProfileQuestion";

export function MultipleChoice({ question, selected, onToggle }: {question: ProfileQuestion, selected: number[], onToggle: (id: number, checked: boolean)=>void}) {
  return (
    <fieldset className="mb-4">
      <legend>{question.description}</legend>
      {question.answers &&  question.answers.map(a => (
        <label key={a.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={a.id ? selected.includes(a.id) : false}
            onChange={(e) => {
              if(a.id) return onToggle(a.id, e.target.checked)
            }}
          />
          {a.description}
        </label>
      ))}
    </fieldset>
  );
}

//Extend this for MC_TEXT
// {a.type === "MC_TEXT" && selected.has(a.id) && (
//    <input
//      className="ml-6 border rounded px-2 py-1"
//      placeholder="Your text…"
//      value={value.answerText ?? ""}
//      onChange={e => change({ answerText: e.target.value })}
//    />
// )}
