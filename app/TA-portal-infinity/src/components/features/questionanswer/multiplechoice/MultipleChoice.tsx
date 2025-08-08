import type { ProfileQuestion } from "../../../../interfaces/question/ProfileQuestion";

export function MultipleChoice({ question, selected, onToggle }: {question: ProfileQuestion, selected: number[], onToggle: (id: number, checked: boolean)=>void}) {
  return (
    <div className="space-y-0 md:space-y-0">
      {question.answers &&  question.answers.map(a => (
        <label key={a.id} className="flex items-start gap-2 md:gap-3 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={a.id ? selected.includes(a.id) : false}
            onChange={(e) => {
              if(a.id) return onToggle(a.id, e.target.checked)
            }}
            className="mt-1 flex-shrink-0"
          />
          <span className="text-sm md:text-base text-gray-700 break-words">{a.description}</span>
        </label>
      ))}
    </div>
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
